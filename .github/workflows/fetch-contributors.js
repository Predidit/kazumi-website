import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 由于我们使用 ES 模块，需要获取 __dirname 的等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub API 端点
const API_URL = 'https://api.github.com/repos/Predidit/Kazumi/contributors';
// 每页数量
const PER_PAGE = 100;

async function fetchAllContributors() {
  let contributors = [];
  let page = 1;
  let hasNextPage = true;

  console.log('开始从 GitHub API 获取贡献者数据...');

  while (hasNextPage) {
    try {
      const response = await fetch(`${API_URL}?per_page=${PER_PAGE}&page=${page}`, {
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

async function main() {
  try {
    const contributors = await fetchAllContributors();
    
    // 保持 GitHub API 的默认排序（按贡献数降序）
    // 不需要额外排序，API 已经按贡献数排序
    
    // 构建输出数据
    const outputData = {
      generated_at: new Date().toISOString(),
      count: contributors.length,
      contributors: contributors
    };
    
    // 写入文件
    const outputPath = join(__dirname, '..', '..', 'src', 'public', 'contributors.json');
    writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    
    console.log(`贡献者数据已写入: ${outputPath}`);
    if (contributors.length > 0) {
      console.log(JSON.stringify(contributors[0], null, 2));
    }
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();