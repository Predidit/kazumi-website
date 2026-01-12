import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件的绝对路径和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub仓库配置
const KAZUMI_REPO = 'Predidit/Kazumi';  // 主仓库
const OHOS_REPO = 'ErBWs/Kazumi';       // 鸿蒙分支仓库
const CONTRIBUTORS_API = `https://api.github.com/repos/${KAZUMI_REPO}/contributors`;  // 贡献者API地址
const PER_PAGE = 100;  // 每页获取的数据量

// 调用GitHub API获取数据
async function fetchGitHubAPI(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: { 
        'Accept': 'application/vnd.github.v3+json', 
        'User-Agent': 'Kazumi-Website-Fetcher' 
      }
    });
    if (!response.ok) throw new Error(`请求失败: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`请求 ${endpoint} 失败:`, error.message);
    throw error;
  }
}

// 获取所有贡献者数据（分页获取）
async function fetchAllContributors() {
  let contributors = [], page = 1, hasNextPage = true;
  console.log('开始获取贡献者数据...');

  while (hasNextPage) {
    try {
      // 分页获取贡献者数据
      const data = await fetchGitHubAPI(`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`);
      if (!data.length) break;  // 没有数据时停止循环

      // 过滤掉特定用户并格式化数据
      const filtered = data
        .filter(c => !['predidit', 'erbws'].includes(c.login.toLowerCase()))
        .map(c => ({ avatar: c.avatar_url, name: c.login, link: c.html_url }));
      
      contributors.push(...filtered);
      console.log(`获取了 ${filtered.length} 个贡献者`);

      // 检查是否有下一页
      const linkHeader = await fetch(`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`).then(r => r.headers.get('Link'));
      hasNextPage = linkHeader?.includes('rel="next")') || false;
      page++;
    } catch (error) {
      console.error('获取贡献者数据时出错:', error);
      break;
    }
  }

  console.log(`总共获取了 ${contributors.length} 个贡献者`);
  return contributors;
}

// 获取指定仓库的最新发布版本
async function fetchLatestRelease(repo) {
  try {
    console.log(`获取 ${repo} 的最新发布...`);
    const data = await fetchGitHubAPI(`https://api.github.com/repos/${repo}/releases/latest`);
    return { tag: data.tag_name, repo };  // 返回标签名和仓库信息
  } catch (error) {
    console.error(`获取 ${repo} 的最新发布失败，使用默认值:`, error.message);
    return { tag: "v1.0.0", repo };  // 出错时返回默认值
  }
}

// 比较新旧数据是否相同（忽略生成时间和时间戳）
function isDataEqual(newData, oldData) {
  if (!oldData) return false;  // 没有旧数据时返回false
  
  // 深拷贝数据以便修改
  const newCopy = JSON.parse(JSON.stringify(newData));
  const oldCopy = JSON.parse(JSON.stringify(oldData));
  
  // 删除时间相关字段以便比较
  delete newCopy.generated_at;
  delete oldCopy.generated_at;
  if (newCopy.kazumi) delete newCopy.kazumi.timestamp;
  if (oldCopy.kazumi) delete oldCopy.kazumi.timestamp;
  if (newCopy.ohos) delete newCopy.ohos.timestamp;
  if (oldCopy.ohos) delete oldCopy.ohos.timestamp;
  
  // 比较JSON字符串
  return JSON.stringify(newCopy) === JSON.stringify(oldCopy);
}

// 主函数：获取并保存数据
async function main() {
  try {
    console.log('开始获取所有数据...');
    
    // 并行获取所有需要的数据
    const [contributors, kazumiRelease, ohosRelease] = await Promise.all([
      fetchAllContributors(),
      fetchLatestRelease(KAZUMI_REPO),
      fetchLatestRelease(OHOS_REPO)
    ]);

    // 定义文件保存路径
    const contributorsPath = join(__dirname, '..', '..', 'src', 'public', 'contributors.json');
    const releasesPath = join(__dirname, '..', '..', 'src', 'public', 'releases.json');

    // 构建要保存的数据结构
    const newContributorsData = { 
      generated_at: new Date().toISOString(),  // 生成时间戳
      count: contributors.length, 
      contributors 
    };
    
    const newReleasesData = {
      kazumi: { ...kazumiRelease, timestamp: new Date().toISOString() },
      ohos: { ...ohosRelease, timestamp: new Date().toISOString() }
    };

    // 读取旧数据（如果存在）
    let oldContributorsData = null, oldReleasesData = null;
    if (existsSync(contributorsPath)) {
      try { 
        oldContributorsData = JSON.parse(readFileSync(contributorsPath, 'utf8')); 
      } catch(e) {
        // 读取失败时忽略错误
      }
    }
    if (existsSync(releasesPath)) {
      try { 
        oldReleasesData = JSON.parse(readFileSync(releasesPath, 'utf8')); 
      } catch(e) {
        // 读取失败时忽略错误
      }
    }

    // 检查数据是否有变化
    const contributorsChanged = !isDataEqual(newContributorsData, oldContributorsData);
    const releasesChanged = !isDataEqual(newReleasesData, oldReleasesData);

    // 只有当数据变化时才写入文件
    if (contributorsChanged) {
      writeFileSync(contributorsPath, JSON.stringify(newContributorsData, null, 2), 'utf8');
      console.log(`贡献者数据已更新: ${contributorsPath}`);
    } else {
      console.log(`贡献者数据未变化`);
    }

    if (releasesChanged) {
      writeFileSync(releasesPath, JSON.stringify(newReleasesData, null, 2), 'utf8');
      console.log(`发布信息数据已更新: ${releasesPath}`);
    } else {
      console.log(`发布信息数据未变化`);
    }

    // 输出执行结果摘要
    console.log(`\n数据获取完成:`);
    console.log(`- 贡献者数量: ${contributors.length}`);
    console.log(`- Kazumi 最新版本: ${kazumiRelease.tag}`);
    console.log(`- OHOS 最新版本: ${ohosRelease.tag}`);
    console.log(`- 贡献者数据${contributorsChanged ? '已' : '未'}更新`);
    console.log(`- 发布信息数据${releasesChanged ? '已' : '未'}更新`);
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);  // 出错时退出进程
  }
}

// 执行主函数
main();