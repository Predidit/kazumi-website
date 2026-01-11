import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 由于我们使用 ES 模块，需要获取 __dirname 的等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub API 端点
const KAZUMI_REPO = 'Predidit/Kazumi';
const OHOS_REPO = 'ErBWs/Kazumi';
const CONTRIBUTORS_API = `https://api.github.com/repos/${KAZUMI_REPO}/contributors`;
const PER_PAGE = 100;

async function fetchGitHubAPI(endpoint, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Kazumi-Website-Fetcher'
  };

  try {
    const response = await fetch(endpoint, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    });

    if (!response.ok) {
      throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`请求 ${endpoint} 失败:`, error.message);
    throw error;
  }
}

async function fetchAllContributors() {
  let contributors = [];
  let page = 1;
  let hasNextPage = true;

  console.log('开始从 GitHub API 获取贡献者数据...');

  while (hasNextPage) {
    try {
      const response = await fetch(`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Kazumi-Website-Fetcher'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.length === 0) {
        hasNextPage = false;
        break;
      }

      // 提取所需字段，并过滤掉作者 Predidit 和 ErBWs
      const pageContributors = data
        .filter(contributor => {
          const login = contributor.login.toLowerCase();
          return login !== 'predidit' && login !== 'erbws';
        })
        .map(contributor => ({
          avatar: contributor.avatar_url,
          name: contributor.login,
          link: contributor.html_url
        }));

      contributors.push(...pageContributors);
      console.log(`获取了 ${pageContributors.length} 个贡献者`);

      // 检查是否有下一页
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        page++;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error('获取贡献者数据时出错:', error);
      hasNextPage = false;
    }
  }

  console.log(`总共获取了 ${contributors.length} 个贡献者`);
  return contributors;
}

async function fetchLatestRelease(repo) {
  try {
    console.log(`获取 ${repo} 的最新发布...`);
    const releaseData = await fetchGitHubAPI(`https://api.github.com/repos/${repo}/releases/latest`);
    
    return {
      tag: releaseData.tag_name,
      repo: repo
    };
  } catch (error) {
    console.error(`获取 ${repo} 的最新发布失败，使用默认值:`, error.message);
    // 返回默认值
    return {
      tag: "v1.0.0",
      repo: repo
    };
  }
}

// 比较两个对象是否相等（不包括时间戳字段）
function isDataEqual(newData, oldData, excludeTimestamp = true) {
  if (!oldData) return false;
  
  // 深度比较两个对象，排除时间戳字段
  const newDataCopy = JSON.parse(JSON.stringify(newData));
  const oldDataCopy = JSON.parse(JSON.stringify(oldData));
  
  // 排除时间戳字段
  if (excludeTimestamp) {
    delete newDataCopy.generated_at;
    delete oldDataCopy.generated_at;
    
    // 对于 releases.json，还需要排除每个 release 的 timestamp
    if (newDataCopy.kazumi) {
      delete newDataCopy.kazumi.timestamp;
      delete oldDataCopy.kazumi?.timestamp;
    }
    if (newDataCopy.ohos) {
      delete newDataCopy.ohos.timestamp;
      delete oldDataCopy.ohos?.timestamp;
    }
  }
  
  return JSON.stringify(newDataCopy) === JSON.stringify(oldDataCopy);
}

async function main() {
  try {
    // 并行获取贡献者和发布信息
    console.log('开始获取所有数据...');
    const [contributors, kazumiRelease, ohosRelease] = await Promise.all([
      fetchAllContributors(),
      fetchLatestRelease(KAZUMI_REPO),
      fetchLatestRelease(OHOS_REPO)
    ]);

    // 构建输出数据 - 贡献者
    const contributorsPath = join(__dirname, '..', '..', 'src', 'public', 'contributors.json');
    const newContributorsData = {
      generated_at: new Date().toISOString(),
      count: contributors.length,
      contributors: contributors
    };
    
    // 构建输出数据 - 发布信息
    const releasesPath = join(__dirname, '..', '..', 'src', 'public', 'releases.json');
    const newReleasesData = {
      kazumi: {
        ...kazumiRelease,
        timestamp: new Date().toISOString()
      },
      ohos: {
        ...ohosRelease,
        timestamp: new Date().toISOString()
      }
    };

    // 读取现有文件（如果存在）
    let oldContributorsData = null;
    if (existsSync(contributorsPath)) {
      try {
        const oldContent = readFileSync(contributorsPath, 'utf8');
        oldContributorsData = JSON.parse(oldContent);
      } catch (error) {
        console.error('读取现有 contributors.json 失败:', error.message);
      }
    }
    
    let oldReleasesData = null;
    if (existsSync(releasesPath)) {
      try {
        const oldContent = readFileSync(releasesPath, 'utf8');
        oldReleasesData = JSON.parse(oldContent);
      } catch (error) {
        console.error('读取现有 releases.json 失败:', error.message);
      }
    }

    // 检查贡献者数据是否有变化
    const contributorsChanged = !isDataEqual(newContributorsData, oldContributorsData, true);
    if (contributorsChanged) {
      writeFileSync(contributorsPath, JSON.stringify(newContributorsData, null, 2), 'utf8');
      console.log(`贡献者数据已更新: ${contributorsPath}`);
    } else {
      console.log(`贡献者数据未变化`);
    }
    
    // 检查发布数据是否有变化
    const releasesChanged = !isDataEqual(newReleasesData, oldReleasesData, true);
    if (releasesChanged) {
      writeFileSync(releasesPath, JSON.stringify(newReleasesData, null, 2), 'utf8');
      console.log(`发布信息数据已更新: ${releasesPath}`);
    } else {
      const kazumiTimestamp = oldReleasesData?.kazumi?.timestamp || '未知';
      const ohosTimestamp = oldReleasesData?.ohos?.timestamp || '未知';
      console.log(`发布信息数据未变化`);
    }
    
    // 显示统计数据
    console.log(`\n数据获取完成:`);
    console.log(`- 贡献者数量: ${contributors.length}`);
    console.log(`- Kazumi 最新版本: ${kazumiRelease.tag}`);
    console.log(`- OHOS 最新版本: ${ohosRelease.tag}`);
    console.log(`- 贡献者数据${contributorsChanged ? '已' : '未'}更新`);
    console.log(`- 发布信息数据${releasesChanged ? '已' : '未'}更新`);
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();