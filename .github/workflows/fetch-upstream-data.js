import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KAZUMI_REPO = 'Predidit/Kazumi';
const OHOS_REPO = 'ErBWs/Kazumi';
const CONTRIBUTORS_API = `https://api.github.com/repos/${KAZUMI_REPO}/contributors`;
const PER_PAGE = 100;

async function fetchGitHubAPI(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Kazumi-Website-Fetcher' }
    });
    if (!response.ok) throw new Error(`请求失败: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`请求 ${endpoint} 失败:`, error.message);
    throw error;
  }
}

async function fetchAllContributors() {
  let contributors = [], page = 1, hasNextPage = true;
  console.log('开始获取贡献者数据...');

  while (hasNextPage) {
    try {
      const data = await fetchGitHubAPI(`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`);
      if (!data.length) break;

      const filtered = data
        .filter(c => !['predidit', 'erbws'].includes(c.login.toLowerCase()))
        .map(c => ({ avatar: c.avatar_url, name: c.login, link: c.html_url }));
      
      contributors.push(...filtered);
      console.log(`获取了 ${filtered.length} 个贡献者`);

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

async function fetchLatestRelease(repo) {
  try {
    console.log(`获取 ${repo} 的最新发布...`);
    const data = await fetchGitHubAPI(`https://api.github.com/repos/${repo}/releases/latest`);
    return { tag: data.tag_name, repo };
  } catch (error) {
    console.error(`获取 ${repo} 的最新发布失败，使用默认值:`, error.message);
    return { tag: "v1.0.0", repo };
  }
}

function isDataEqual(newData, oldData) {
  if (!oldData) return false;
  const newCopy = JSON.parse(JSON.stringify(newData));
  const oldCopy = JSON.parse(JSON.stringify(oldData));
  delete newCopy.generated_at;
  delete oldCopy.generated_at;
  if (newCopy.kazumi) delete newCopy.kazumi.timestamp;
  if (oldCopy.kazumi) delete oldCopy.kazumi.timestamp;
  if (newCopy.ohos) delete newCopy.ohos.timestamp;
  if (oldCopy.ohos) delete oldCopy.ohos.timestamp;
  return JSON.stringify(newCopy) === JSON.stringify(oldCopy);
}

async function main() {
  try {
    console.log('开始获取所有数据...');
    const [contributors, kazumiRelease, ohosRelease] = await Promise.all([
      fetchAllContributors(),
      fetchLatestRelease(KAZUMI_REPO),
      fetchLatestRelease(OHOS_REPO)
    ]);

    const contributorsPath = join(__dirname, '..', '..', 'src', 'public', 'contributors.json');
    const releasesPath = join(__dirname, '..', '..', 'src', 'public', 'releases.json');

    const newContributorsData = { generated_at: new Date().toISOString(), count: contributors.length, contributors };
    const newReleasesData = {
      kazumi: { ...kazumiRelease, timestamp: new Date().toISOString() },
      ohos: { ...ohosRelease, timestamp: new Date().toISOString() }
    };

    let oldContributorsData = null, oldReleasesData = null;
    if (existsSync(contributorsPath)) {
      try { oldContributorsData = JSON.parse(readFileSync(contributorsPath, 'utf8')); } catch(e) {}
    }
    if (existsSync(releasesPath)) {
      try { oldReleasesData = JSON.parse(readFileSync(releasesPath, 'utf8')); } catch(e) {}
    }

    const contributorsChanged = !isDataEqual(newContributorsData, oldContributorsData);
    const releasesChanged = !isDataEqual(newReleasesData, oldReleasesData);

    if (contributorsChanged) {
      writeFileSync(contributorsPath, JSON.stringify(newContributorsData, null, 2), 'utf8');
      console.log(`贡献者数据已更新: ${contributorsPath}`);
    } else console.log(`贡献者数据未变化`);

    if (releasesChanged) {
      writeFileSync(releasesPath, JSON.stringify(newReleasesData, null, 2), 'utf8');
      console.log(`发布信息数据已更新: ${releasesPath}`);
    } else console.log(`发布信息数据未变化`);

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

main();