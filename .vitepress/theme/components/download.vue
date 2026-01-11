<template>
  <div class="github-release-download">
    <div class="download-header">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在获取版本信息...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">⚠️ 无法获取版本信息: {{ error }}</p>
      <p class="fallback-info">使用默认版本: {{ fallbackTag }}</p>
    </div>
    
    <!-- 正常状态 -->
    <template v-else>
      <!-- 镜像下载开关 -->
      <div v-if="showMirrorSwitch" class="mirror-switch">
        <div class="mirror-control">
          <label class="switch">
            <input
              type="checkbox"
              :checked="useMirror"
              @change="useMirror = !useMirror"
            >
            <span class="slider"></span>
          </label>
          <span class="mirror-label">
            使用镜像下载(OHOS不可用)
          </span>
        </div>
      </div>
      
      <div class="download-list">
        <div
          v-for="platform in platforms"
          :key="platform.id"
          class="download-item"
        >
          <div class="platform-header">
            <span class="platform-icon" v-html="iconMap[platform.id]"></span>
            <div class="platform-title">
              <h4>{{ platform.name }}</h4>
              <p class="platform-description">{{ platform.description }}</p>
              <p v-if="platform.id === 'ohos'" class="platform-tag-info">
                鸿蒙版本: {{ ohosTag }}
              </p>
            </div>
          </div>
          
          <div class="download-links">
            <a
              v-for="(link, index) in platform.links"
              :key="index"
              :href="getDownloadUrl(platform, link)"
              class="download-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>
      
      <!-- 发布信息 -->
      <div v-if="showReleaseInfo" class="release-info">
        <div class="version-info">
          <strong>主仓库版本:</strong> {{ currentTag }}
          <span v-if="ohosTag" class="ohos-version">
            <strong>鸿蒙分支版本:</strong> {{ ohosTag }}
          </span>
        </div>
        
        <a
          v-if="githubUrl"
          :href="githubUrl"
          class="github-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          查看所有版本 →
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { iconMap } from './icon.ts'

const props = defineProps({
  title: {
    type: String,
    default: '下载 Kazumi'
  },
  description: {
    type: String,
    default: '选择适合您操作系统的版本下载'
  },
  releaseTag: {
    type: String,
    default: ''
  },
  githubRepo: {
    type: String,
    default: 'Predidit/Kazumi'
  },
  ohosRepo: {
    type: String,
    default: 'ErBWs/Kazumi'
  },
  ohosTag: {
    type: String,
    default: ''
  },
  showReleaseInfo: {
    type: Boolean,
    default: true
  },
  enableMirror: {
    type: Boolean,
    default: false
  },
  mirrorBaseUrl: {
    type: String,
    default: 'https://atomgit.com/gh_mirrors/ka/Kazumi/releases/download'
  },
  showMirrorSwitch: {
    type: Boolean,
    default: true
  },
  customPlatforms: {
    type: Array,
    default: () => []
  },
  releasesFile: {
    type: String,
    default: '/releases.json'
  },
  fallbackTag: {
    type: String,
    default: 'tag'
  }
})

// 响应式数据
const loading = ref(true)
const error = ref(null)
const currentTag = ref(props.releaseTag || props.fallbackTag)
const ohosTag = ref(props.ohosTag || props.releaseTag || props.fallbackTag)
const useMirror = ref(props.enableMirror)

// 计算属性
const githubUrl = computed(() => {
  return `https://github.com/${props.githubRepo}/releases`
})

// 平台配置
const defaultPlatforms = [
  {
    id: 'android',
    name: 'Android',
    description: '适用于 Android 10 及以上',
    links: [
      { label: 'APK', url: 'Kazumi_android_{tag}.apk' },
      { label: 'F-Droid', url: 'https://f-droid.org/packages/com.predidit.kazumi', external: true }
    ]
  },
  {
    id: 'ios',
    name: 'iOS',
    description: '适用于 iOS/iPadOS 13 及以上',
    links: [
      { label: 'IPA', url: 'Kazumi_ios_{tag}_no_sign.ipa' },
      {label: '安装文档', url: 'docs/misc/how-to-install-in-ios', external: true}
    ]
  },
  {
    id: 'windows',
    name: 'Windows',
    description: '适用于 Windows 10 及以上',
    links: [
      { label: 'MSIX', url: 'Kazumi_windows_{tag}.msix' },
      { label: '便携版', url: 'Kazumi_windows_{tag}.zip' }
    ]
  },
  {
    id: 'mac',
    name: 'macOS',
    description: '适用于 MacOS 10.15 及以上',
    links: [
      { label: 'DMG', url: 'Kazumi_macos_{tag}.dmg' }
    ]
  },
  {
    id: 'linux',
    name: 'Linux',
    description: '实验性支持',
    links: [
      { label: 'DEB', url: 'Kazumi_linux_{tag}_amd64.deb' },
      { label: '便携版', url: 'Kazumi_linux_{tag}_amd64.tar.gz' },
      { label: 'Flathub', url: 'https://flathub.org/en/apps/io.github.Predidit.Kazumi', external: true }
    ]
  },
  {
    id: 'ohos',
    name: 'OHOS',
    description: '适用于 HarmonyOS NEXT',
    repo: props.ohosRepo,
    useOhosTag: true,
    links: [
      { label: 'HAP', url: 'Kazumi_ohos_{tag}_unsigned.hap' },
      {label: '安装文档', url: 'docs/misc/how-to-install-in-ohos', external: true}
    ]
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    description: '实验性支持',
    links:[
      {label: '下载文档', url: 'docs/intro/how-to-download#arch-linux', external: true}
    ]
  }
]

const platforms = computed(() => {
  return props.customPlatforms.length > 0 ? props.customPlatforms : defaultPlatforms
})

// 方法
const getDownloadUrl = (platform, link) => {
  if (link.external) return link.url
  
  const tag = platform.useOhosTag ? ohosTag.value : currentTag.value
  const repo = platform.repo || props.githubRepo
  
  let baseUrl = useMirror.value && !platform.useOhosTag && repo === props.githubRepo
    ? props.mirrorBaseUrl
    : `https://github.com/${repo}/releases/download`
  
  const url = link.url.replace('{tag}', tag)
  return `${baseUrl}/${tag}/${url}`
}

// 从文件获取release信息
const fetchFromFile = async () => {
  try {
    const response = await fetch(props.releasesFile)
    if (!response.ok) throw new Error(`文件加载失败: ${response.status}`)
    
    const data = await response.json()
    
    if (data.kazumi?.tag) {
      currentTag.value = data.kazumi.tag
    }
    
    if (data.ohos?.tag) {
      ohosTag.value = data.ohos.tag
    }
    
    return true
  } catch (err) {
    error.value = `无法加载版本信息: ${err.message}`
    currentTag.value = props.fallbackTag
    ohosTag.value = props.ohosTag || props.fallbackTag
    return false
  }
}

const fetchLatestRelease = async () => {
  if (!props.releaseTag) {
    try {
      loading.value = true
      error.value = null
      await fetchFromFile()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  } else {
    currentTag.value = props.releaseTag
    ohosTag.value = props.ohosTag || props.releaseTag
    loading.value = false
  }
}

onMounted(fetchLatestRelease)
</script>

<style scoped>
.github-release-download {
  margin: 1rem auto;
  padding: 1.25rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  max-width: 900px;
  width: calc(100% - 2rem);
  box-sizing: border-box;
}

.download-header {
  margin-bottom: 1rem;
  text-align: center;
}

.download-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-border);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  padding: 2rem;
  text-align: center;
  background: var(--vp-c-danger-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-danger);
}

.error-message {
  color: var(--vp-c-danger);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.fallback-info {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0;
}

.mirror-switch {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

.mirror-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--vp-c-border);
  transition: .4s;
  border-radius: 18px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--vp-c-brand);
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.mirror-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.download-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  transition: all 0.2s ease;
}

.download-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.platform-icon {
  font-size: 1.8rem;
  min-width: 2.5rem;
  text-align: center;
}

.platform-title h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.platform-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.platform-tag-info {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.download-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.download-link {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.download-link:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateY(-1px);
}

.release-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-border);
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.version-info {
  flex: 1;
}

.ohos-version {
  margin-left: 1rem;
}

.github-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.github-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .download-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .download-links {
    width: 100%;
    justify-content: flex-start;
  }
  
  .release-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .version-info {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .github-release-download {
    padding: 1rem;
  }
  
  .download-item {
    padding: 0.75rem;
  }
  
  .download-links {
    flex-direction: column;
    width: 100%;
  }
  
  .download-link {
    width: 100%;
    text-align: center;
  }
}
</style>