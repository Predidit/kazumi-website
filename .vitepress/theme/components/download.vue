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
      <p v-if="usingCache" class="cache-indicator">（使用缓存数据）</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">⚠️ 无法获取版本信息: {{ error }}</p>
      <p class="fallback-info">使用默认版本: {{ fallbackTag }}</p>
    </div>
    
    <!-- 正常状态 -->
    <template v-else>
      <div class="download-list">
        <div 
          v-for="platform in platforms" 
          :key="platform.id"
          class="download-item"
        >
          <div class="platform-header">
            <span class="platform-icon" v-html="getPlatformIcon(platform.id)"></span>
            <div class="platform-title">
              <h4>{{ platform.name }}</h4>
              <p class="platform-description">{{ platform.description }}</p>
              <p v-if="platform.id === 'ohos' && ohosTag !== currentTag" class="platform-tag-info">
                鸿蒙版本: {{ ohosTag }}
              </p>
            </div>
          </div>
          
          <div class="download-links">
            <a
              v-for="link in platform.links"
              :key="link.type"
              :href="getDownloadUrl(platform, link)"
              class="download-link"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackDownload(platform.id, link.type)"
            >
              <span class="link-icon" v-html="getLinkIcon(link.type)"></span>
              <span class="link-text">{{ link.label }}</span>
            </a>
          </div>
        </div>
      </div>
      
      <div v-if="showReleaseInfo" class="release-info">
        <div class="release-info-header">
          <div class="version-info">
            <strong>主仓库版本:</strong> {{ currentTag }}
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
        <div v-if="ohosTag && ohosTag !== currentTag" class="ohos-version">
          <strong>鸿蒙分支版本:</strong> {{ ohosTag }}
        </div>
      </div>
    </template>
    
    <!-- 镜像开关（放在容器最下面） -->
    <div v-if="showMirrorToggle" class="mirror-toggle-section">
      <label class="mirror-toggle">
        <input 
          type="checkbox" 
          v-model="useMirror" 
          @change="handleMirrorToggle"
          class="mirror-toggle-input"
        >
        <span class="mirror-toggle-slider"></span>
        <span class="mirror-toggle-label">
          <span class="mirror-toggle-icon">🔄</span>
          使用 AtomGit 镜像下载
          <span v-if="useMirror" class="mirror-status-active">(已启用)</span>
          <span v-else class="mirror-status-inactive">(已禁用)</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps({
  // 基础配置
  title: {
    type: String,
    default: '下载 Kazumi'
  },
  description: {
    type: String,
    default: '选择适合您操作系统的版本下载'
  },
  
  // GitHub Release 配置
  releaseTag: {
    type: String,
    default: ''  // 留空则自动获取最新版本
  },
  githubRepo: {
    type: String,
    default: 'Predidit/Kazumi'
  },
  
  // 鸿蒙配置
  ohosRepo: {
    type: String,
    default: 'ErBWs/Kazumi'
  },
  ohosTag: {
    type: String,
    default: ''  // 留空则从鸿蒙仓库获取最新版本
  },
  
  // 显示选项
  showReleaseInfo: {
    type: Boolean,
    default: true
  },
  
  // 自定义平台配置
  customPlatforms: {
    type: Array,
    default: () => []
  },
  
  // API 配置
  useLatestRelease: {
    type: Boolean,
    default: true
  },
  fallbackTag: {
    type: String,
    default: 'tag'
  },
  
  // 缓存配置
  cacheDuration: {
    type: Number,
    default: 30 * 60 * 1000 // 默认30分钟（毫秒）
  },
  enableCache: {
    type: Boolean,
    default: true
  },
  
  // 镜像配置
  showMirrorToggle: {
    type: Boolean,
    default: true
  },
  defaultUseMirror: {
    type: Boolean,
    default: false // 默认不使用镜像
  },
  mirrorBaseUrl: {
    type: String,
    default: 'https://atomgit.com/gh_mirrors/ka/Kazumi/releases/download'
  },
  
  // 显示下载源信息
  showDownloadSourceInfo: {
    type: Boolean,
    default: true
  },
  
  // 本地存储配置
  saveMirrorPreference: {
    type: Boolean,
    default: true
  },
  storageKey: {
    type: String,
    default: 'github_download_use_mirror'
  }
})

// 响应式数据
const loading = ref(true)
const error = ref(null)
const latestTag = ref('')
const currentTag = ref(props.releaseTag || props.fallbackTag)
const ohosTag = ref(props.ohosTag || props.releaseTag || props.fallbackTag)
const usingCache = ref(false)
const useMirror = ref(props.defaultUseMirror) // 镜像开关状态

// 计算属性
const githubUrl = computed(() => {
  return `https://github.com/${props.githubRepo}/releases`
})

const apiUrl = computed(() => {
  if (props.useLatestRelease) {
    return `https://api.github.com/repos/${props.githubRepo}/releases/latest`
  }
  return `https://api.github.com/repos/${props.githubRepo}/releases`
})

// 鸿蒙API地址
const ohosApiUrl = computed(() => {
  return `https://api.github.com/repos/${props.ohosRepo}/releases/latest`
})

// 加载镜像偏好设置
const loadMirrorPreference = () => {
  if (!props.saveMirrorPreference) {
    useMirror.value = props.defaultUseMirror
    return
  }
  
  try {
    const saved = localStorage.getItem(props.storageKey)
    if (saved !== null) {
      useMirror.value = JSON.parse(saved)
    } else {
      useMirror.value = props.defaultUseMirror
    }
  } catch (error) {
    useMirror.value = props.defaultUseMirror
  }
}

// 保存镜像偏好设置
const saveMirrorPreference = () => {
  if (!props.saveMirrorPreference) return
  
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(useMirror.value))
  } catch (error) {
    // 忽略存储错误
  }
}

// 处理镜像开关变化
const handleMirrorToggle = () => {
  saveMirrorPreference()
  // 触发一个事件，让父组件知道设置已更改
  emit('mirrorToggle', useMirror.value)
}

// 生成缓存键
const getCacheKey = (repo, isLatest = true) => {
  return `github_release_${repo}_${isLatest ? 'latest' : 'all'}`
}

// 检查并获取缓存
const getCachedData = (repo, isLatest = true) => {
  if (!props.enableCache) return null
  
  try {
    const cacheKey = getCacheKey(repo, isLatest)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    
    // 检查缓存是否过期
    if (now - timestamp < props.cacheDuration) {
      return data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 保存数据到缓存
const saveToCache = (data, repo, isLatest = true) => {
  if (!props.enableCache) return
  
  try {
    const cacheKey = getCacheKey(repo, isLatest)
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
  }
}

// 默认平台配置
const defaultPlatforms = [
  {
    id: 'android',
    name: 'Android',
    description: '适用于 Android 10 及以上',
    links: [
      {
        type: 'apk',
        label: '下载 APK',
        url: 'Kazumi_android_{tag}.apk'
      }
    ]
  },
  {
    id: 'ios',
    name: 'iOS',
    description: '适用于 iOS/iPadOS 13 及以上 (需要自签名)',
    links: [
      {
        type: 'ipa',
        label: '下载 IPA',
        url: 'Kazumi_ios_{tag}_no_sign.ipa'
      }
    ]
  },
  {
    id: 'windows',
    name: 'Windows',
    description: '适用于 Windows 10 及以上',
    links: [
      {
        type: 'msix',
        label: 'MSIX 安装包',
        url: 'Kazumi_windows_{tag}.msix'
      },
      {
        type: 'zip',
        label: '便携版 (ZIP)',
        url: 'Kazumi_windows_{tag}.zip'
      }
    ]
  },
  {
    id: 'mac',
    name: 'macOS',
    description: '适用于 MacOS 10.15 及以上',
    links: [
      {
        type: 'dmg',
        label: '下载 DMG',
        url: 'Kazumi_macos_{tag}.dmg'
      }
    ]
  },
  {
    id: 'linux',
    name: 'Linux',
    description: '适用于 Linux (实验性)',
    links: [
      {
        type: 'deb',
        label: 'DEB 包',
        url: 'Kazumi_linux_{tag}_amd64.deb'
      },
      {
        type: 'tar',
        label: '便携版 (TAR.GZ)',
        url: 'Kazumi_linux_{tag}_amd64.tar.gz'
      }
    ]
  },
  {
    id: 'ohos',
    name: 'OHOS',
    description: '适用于 HarmonyOS NEXT',
    repo: props.ohosRepo, // 使用单独的鸿蒙仓库
    useOhosTag: true, // 使用鸿蒙分支的tag
    links: [
      {
        type: 'hap',
        label: '下载 HAP',
        url: 'Kazumi_ohos_{tag}_unsigned.hap'
      }
    ]
  }
]

// 合并自定义配置
const platforms = computed(() => {
  if (props.customPlatforms.length > 0) {
    return props.customPlatforms
  }
  return defaultPlatforms
})

// 方法
const getDownloadUrl = (platform, link) => {
  // 确定使用的tag
  let tag = currentTag.value
  if (platform.useOhosTag) {
    tag = ohosTag.value
  }
  
  // 如果使用镜像且不是鸿蒙分支
  if (useMirror.value && !platform.useOhosTag) {
    const url = link.url.replace('{tag}', tag)
    return `${props.mirrorBaseUrl}/${tag}/${url}`
  }
  
  // 否则使用GitHub链接
  const repo = platform.repo || props.githubRepo
  const baseUrl = `https://github.com/${repo}/releases/download`
  const url = link.url.replace('{tag}', tag)
  return `${baseUrl}/${tag}/${url}`
}

const getPlatformIcon = (platformId) => {
  const icons = {
    android: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M18.44 5.559q-1.015 1.748-2.028 3.498q-.055-.023-.111-.043a12.1 12.1 0 0 0-8.68.033C7.537 8.897 5.868 6.026 5.6 5.56a1 1 0 0 0-.141-.19a1.104 1.104 0 0 0-1.768 1.298c1.947 3.37-.096-.216 1.948 3.36c.017.03-.495.263-1.393 1.017C2.9 12.176.452 14.772 0 18.99h24a11.7 11.7 0 0 0-.746-3.068a12.1 12.1 0 0 0-2.74-4.184a12 12 0 0 0-2.131-1.687c.66-1.122 1.312-2.256 1.965-3.385a1.11 1.11 0 0 0-.008-1.12a1.1 1.1 0 0 0-.852-.532c-.522-.054-.939.313-1.049.545m-.04 8.46c.395.593.324 1.331-.156 1.65c-.480.32-1.188.1-1.582-.493s-.324-1.33.156-1.65c.473-.316 1.182-.11 1.582.494m-11.193-.492c.48.32.55 1.058.156 1.65c-.394.593-1.103.815-1.584.495c-.48-.32-.55-1.058-.156-1.65c.4-.603 1.109-.811 1.584-.495"/></svg>',
    ios: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M1.1 6.05c-.614 0-1.1.48-1.1 1.08a1.08 1.08 0 0 0 1.1 1.08c.62 0 1.11-.48 1.11-1.08S1.72 6.05 1.1 6.05m7.61.02c-3.36 0-5.46 2.29-5.46 5.93c0 3.67 2.1 5.95 5.46 5.95c3.34 0 5.45-2.28 5.45-5.95c0-3.64-2.11-5.93-5.45-5.93m10.84 0c-2.5 0-4.28 1.38-4.28 3.43c0 1.63 1.01 2.65 3.13 3.14l1.49.36c1.45.33 2.04.81 2.04 1.64c0 .96-.97 1.64-2.35 1.64c-1.41 0-2.47-.69-2.58-1.75h-2c.08 2.12 1.82 3.42 4.46 3.42c2.79 0 4.54-1.37 4.54-3.55c0-1.71-1-2.68-3.32-3.21l-1.33-.3c-1.41-.34-1.99-.79-1.99-1.55c0-.96.88-1.6 2.18-1.6c1.31 0 2.21.65 2.31 1.72h1.96c-.05-2.02-1.72-3.39-4.26-3.39M8.71 7.82c2.04 0 3.35 1.63 3.35 4.18c0 2.57-1.31 4.2-3.35 4.2c-2.06 0-3.36-1.63-3.36-4.2c0-2.55 1.3-4.18 3.36-4.18M.111 9.31v8.45H2.1V9.31z"/></svg>',
    windows: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M0 0h11.377v11.372H0Zm12.623 0H24v11.372H12.623ZM0 12.623h11.377V24H0Zm12.623 0H24V24H12.623"/></svg>',
    mac: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M0 14.727h.941v-2.453c0-.484.318-.835.771-.835c.439 0 .71.276.71.722v2.566h.915V12.25c0-.48.31-.812.764-.812c.46 0 .718.28.718.77v2.518h.94v-2.748c0-.801-.517-1.334-1.307-1.334c-.578 0-1.054.31-1.247.805h-.023c-.147-.514-.552-.805-1.118-.805c-.545 0-.968.306-1.142.771H.903v-.695H0v4.006zm7.82-.646c-.408 0-.68-.208-.68-.537c0-.318.26-.522.714-.552l.926-.057v.307c0 .483-.427.839-.96.839m-.284.71c.514 0 1.017-.268 1.248-.703h.018v.639h.908v-2.76c0-.804-.647-1.33-1.64-1.33c-1.021 0-1.66.537-1.701 1.285h.873c.06-.332.344-.548.79-.548c.464 0 .748.242.748.662v.287l-1.058.06c-.976.061-1.524.488-1.524 1.199c0 .721.564 1.209 1.338 1.209m6.305-2.642c-.065-.843-.719-1.512-1.777-1.512c-1.164 0-1.92.805-1.92 2.087c0 1.3.756 2.082 1.928 2.082c1.005 0 1.697-.59 1.772-1.485h-.888c-.087.453-.397.725-.873.725c-.597 0-.982-.483-.982-1.322c0-.824.381-1.323.975-1.323c.502 0 .8.321.876.748zm2.906-2.967c-1.591 0-2.589 1.085-2.589 2.82s.998 2.816 2.59 2.816c1.586 0 2.584-1.081 2.584-2.816s-.997-2.82-2.585-2.82m0 .832c.971 0 1.591.77 1.591 1.988c0 1.213-.62 1.984-1.59 1.984c-.976 0-1.592-.77-1.592-1.984c0-1.217.616-1.988 1.591-1.988m2.982 3.178c.042 1.006.866 1.626 2.12 1.626c1.32 0 2.151-.65 2.151-1.686c0-.813-.469-1.27-1.576-1.523l-.627-.144c-.67-.158-.945-.37-.945-.733c0-.453.415-.756 1.032-.756c.623 0 1.05.306 1.096.817h.93c-.023-.96-.817-1.61-2.019-1.61c-1.187 0-2.03.653-2.03 1.62c0 .78.477 1.263 1.482 1.494l.707.166c.688.163.967.39.967.782c0 .454-.457.779-1.115.779c-.665 0-1.167-.329-1.228-.832z"/></svg>',
    ohos: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M1.861 0H3.59v3.548h3.861V0H9.19v8.883H7.458V5.136H3.59v3.746H1.858Zm11.993 0h1.706l2.809 4.7h.1L21.278 0h1.719v8.883h-1.719v-4.38l.1-1.489h-.1l-2.334 3.983h-1.039l-2.347-3.983h-.1l.1 1.489v4.38h-1.706Zm4.702 21.648a4 4 0 0 1-1.154-.161a3.4 3.4 0 0 1-1.01-.484a3.5 3.5 0 0 1-.8-.782a3.8 3.8 0 0 1-.538-1.092l1.666-.62a2.4 2.4 0 0 0 .643 1.116a1.68 1.68 0 0 0 1.207.434a2.2 2.2 0 0 0 .524-.062a1.8 1.8 0 0 0 .459-.2a1 1 0 0 0 .328-.335a.9.9 0 0 0 .118-.459a1.05 1.05 0 0 0-.092-.447a1 1 0 0 0-.315-.373a2.5 2.5 0 0 0-.564-.335a8 8 0 0 0-.852-.335l-.577-.2a5 5 0 0 1-.774-.335a3.4 3.4 0 0 1-.7-.509a2.7 2.7 0 0 1-.525-.695a2.1 2.1 0 0 1-.2-.918a2.25 2.25 0 0 1 .21-.968a2.4 2.4 0 0 1 .616-.794a2.9 2.9 0 0 1 .957-.533a3.7 3.7 0 0 1 1.246-.2a3.6 3.6 0 0 1 1.22.186a2.8 2.8 0 0 1 .879.459a2.5 2.5 0 0 1 .59.608a3 3 0 0 1 .328.633l-1.56.62a1.55 1.55 0 0 0-.485-.67a1.4 1.4 0 0 0-.944-.3a1.66 1.66 0 0 0-.957.261a.75.75 0 0 0-.38.658a.84.84 0 0 0 .367.682a4.2 4.2 0 0 0 1.167.534l.59.186a6.3 6.3 0 0 1 1.023.434a3 3 0 0 1 .8.57a2.2 2.2 0 0 1 .511.769a2.4 2.4 0 0 1 .183.98a2.3 2.3 0 0 1-.3 1.2a2.6 2.6 0 0 1-.747.819a3.4 3.4 0 0 1-1.036.484a4.2 4.2 0 0 1-1.128.161Zm-13.028 0a4.44 4.44 0 0 1-3.23-1.34a4.8 4.8 0 0 1-.956-1.476a4.9 4.9 0 0 1-.339-1.824a4.8 4.8 0 0 1 .339-1.811a4.6 4.6 0 0 1 .956-1.477a4.4 4.4 0 0 1 1.427-.992a4.5 4.5 0 0 1 1.8-.36a4.4 4.4 0 0 1 1.79.36a4.3 4.3 0 0 1 1.44.992a4.4 4.4 0 0 1 .944 1.477a4.7 4.7 0 0 1 .351 1.811a4.8 4.8 0 0 1-.351 1.824a4.6 4.6 0 0 1-.944 1.476a4.5 4.5 0 0 1-3.23 1.34Zm0-1.588a2.8 2.8 0 0 0 1.125-.223a2.8 2.8 0 0 0 .92-.621a2.7 2.7 0 0 0 .617-.955a3.3 3.3 0 0 0 .23-1.253a3.2 3.2 0 0 0-.23-1.24a2.7 2.7 0 0 0-.617-.968a2.8 2.8 0 0 0-.92-.62a2.8 2.8 0 0 0-1.125-.223a2.86 2.86 0 0 0-2.057.844a3 3 0 0 0-.617.968a3.4 3.4 0 0 0-.218 1.24a3.5 3.5 0 0 0 .218 1.253a3 3 0 0 0 .617.955a2.86 2.86 0 0 0 2.057.843m-3.297 2.428h6.5V24h-6.5Z"/></svg>'
  }
  return icons[platformId] || '📦'
}

const getLinkIcon = (linkType) => {
  const icons = {
    apk: '📱',
    ipa: '📱',
    msix: '🪟',
    zip: '📦',
    dmg: '🍎',
    deb: '🐧',
    tar: '📦',
    hap: '📱'
  }
  return icons[linkType] || '⬇️'
}

// 定义事件
const emit = defineEmits(['mirrorToggle'])

// 获取鸿蒙仓库的release信息
const fetchOhosRelease = async () => {
  try {
    // 首先尝试从缓存获取
    const cachedData = getCachedData(props.ohosRepo, true)
    if (cachedData) {
      ohosTag.value = cachedData.tag_name
      return
    }
    
    const response = await fetch(ohosApiUrl.value, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`鸿蒙仓库 GitHub API 错误: ${response.status}`)
    }
    
    const data = await response.json()
    ohosTag.value = data.tag_name
    
    // 保存到缓存
    saveToCache(data, props.ohosRepo, true)
    
  } catch (err) {
    // 使用props中指定的tag或fallback
    ohosTag.value = props.ohosTag || props.fallbackTag
  }
}

const fetchLatestRelease = async () => {
  if (!props.useLatestRelease && props.releaseTag) {
    // 如果指定了固定版本，则使用该版本
    currentTag.value = props.releaseTag
    ohosTag.value = props.ohosTag || props.releaseTag
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    // 1. 首先尝试从缓存获取主仓库数据
    const cachedData = getCachedData(props.githubRepo, props.useLatestRelease)
    if (cachedData) {
      usingCache.value = true
      updateFromData(cachedData)
      loading.value = false
      
      // 仍然在后台获取最新数据更新缓存
      setTimeout(() => {
        fetchFromAPI()
      }, 100)
    } else {
      // 2. 缓存不存在或已过期，从 API 获取
      await fetchFromAPI()
    }
    
    // 3. 获取鸿蒙仓库的release信息（并行进行）
    fetchOhosRelease()
    
  } catch (err) {
    error.value = err.message
    currentTag.value = props.fallbackTag
    ohosTag.value = props.ohosTag || props.fallbackTag
  } finally {
    loading.value = false
  }
}

// 从 API 获取数据
const fetchFromAPI = async () => {
  try {
    const response = await fetch(apiUrl.value, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API 错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 更新数据并保存到缓存
    updateFromData(data)
    saveToCache(data, props.githubRepo, props.useLatestRelease)
    
  } catch (err) {
  }
}

// 更新数据
const updateFromData = (data) => {
  if (props.useLatestRelease) {
    // 获取最新版本
    latestTag.value = data.tag_name
    currentTag.value = latestTag.value
  } else {
    // 获取所有版本，使用第一个
    if (data.length > 0) {
      latestTag.value = data[0].tag_name
      currentTag.value = latestTag.value
    }
  }
}

// 监听 props 变化
watch(() => props.releaseTag, (newTag) => {
  if (newTag) {
    currentTag.value = newTag
    // 如果没有单独指定鸿蒙tag，也更新鸿蒙tag
    if (!props.ohosTag) {
      ohosTag.value = newTag
    }
  }
})

watch(() => props.githubRepo, () => {
  usingCache.value = false
  fetchLatestRelease()
})

watch(() => props.ohosRepo, () => {
  // 更新鸿蒙仓库配置并重新获取
  defaultPlatforms.find(p => p.id === 'ohos').repo = props.ohosRepo
  fetchOhosRelease()
})

watch(() => props.ohosTag, (newTag) => {
  if (newTag) {
    ohosTag.value = newTag
  }
})

// 监听镜像配置变化
watch(() => props.defaultUseMirror, (newValue) => {
  useMirror.value = newValue
})

// 生命周期
onMounted(() => {
  // 加载镜像偏好设置
  loadMirrorPreference()
  // 获取发布信息
  fetchLatestRelease()
})
</script>

<style scoped>
.github-release-download {
  margin: 2rem auto;
  padding: 1.75rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  max-width: 900px;
  width: calc(100% - 2rem);
  box-sizing: border-box;
}

.download-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.download-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.description {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

/* 镜像开关样式 */
.mirror-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  padding: 0.75rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

.mirror-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.mirror-toggle:hover {
  background: var(--vp-c-bg-soft);
}

.mirror-toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mirror-toggle-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: var(--vp-c-gray-3);
  border-radius: 24px;
  margin-right: 0.75rem;
  transition: background-color 0.3s;
}

.mirror-toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.mirror-toggle-input:checked + .mirror-toggle-slider {
  background-color: var(--vp-c-brand);
}

.mirror-toggle-input:checked + .mirror-toggle-slider:before {
  transform: translateX(20px);
}

.mirror-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.mirror-toggle-icon {
  font-size: 1.1rem;
}

.mirror-status-active {
  color: var(--vp-c-green);
  font-size: 0.85rem;
  font-weight: normal;
}

.mirror-status-inactive {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  font-weight: normal;
}

.mirror-info-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  text-align: center;
  max-width: 400px;
}

/* 加载状态 */
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

.cache-indicator {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
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

/* 列表式布局 */
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  transform: translateY(-1px);
}

/* 发布信息 */
.release-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-border);
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.release-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.version-info {
  margin: 0;
}

.github-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.github-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.ohos-version {
  margin: 0;
}

.mirror-source-info {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.mirror-toggle-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mirror-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.mirror-toggle:hover {
  background: var(--vp-c-bg-soft);
}

.mirror-toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mirror-toggle-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: var(--vp-c-gray-3);
  border-radius: 24px;
  margin-right: 0.75rem;
  transition: background-color 0.3s;
}

.mirror-toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.mirror-toggle-input:checked + .mirror-toggle-slider {
  background-color: var(--vp-c-brand);
}

.mirror-toggle-input:checked + .mirror-toggle-slider:before {
  transform: translateX(20px);
}

.mirror-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.mirror-toggle-icon {
  font-size: 1.1rem;
}

.mirror-status-active {
  color: var(--vp-c-green);
  font-size: 0.85rem;
  font-weight: normal;
}

.mirror-status-inactive {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  font-weight: normal;
}

.mirror-info-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  text-align: center;
  max-width: 400px;
}

/* 响应式设计 */
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
  
  .release-info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .github-link {
    align-self: flex-start;
  }
  
  .mirror-toggle-label {
    font-size: 0.9rem;
  }
  
  .mirror-info-text {
    font-size: 0.8rem;
  }
}
</style>