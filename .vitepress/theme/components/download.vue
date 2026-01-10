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
      <div v-if="showMirrorSwitch && !loading && !error" class="mirror-switch">
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
            <span class="platform-icon" v-html="getPlatformIcon(platform.id)"></span>
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
      <div v-if="ohosTag" class="ohos-version">
        <strong>鸿蒙分支版本:</strong> {{ ohosTag }}
      </div>
      </div>
    </template>
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
  
  // 镜像下载配置
  enableMirror: {
    type: Boolean,
    default: false  // 默认不使用镜像
  },
  mirrorBaseUrl: {
    type: String,
    default: 'https://atomgit.com/gh_mirrors/ka/Kazumi/releases/download'
  },
  showMirrorSwitch: {
    type: Boolean,
    default: true  // 显示镜像开关
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
  
  // 文件配置
  releasesFile: {
    type: String,
    default: '/releases.json'
  },
  useFileFirst: {
    type: Boolean,
    default: true
  },
  
  // 缓存配置
  cacheDuration: {
    type: Number,
    default: 30 * 60 * 1000 // 默认30分钟（毫秒）
  },
  enableCache: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const loading = ref(true)
const error = ref(null)
const latestTag = ref('')
const currentTag = ref(props.releaseTag || props.fallbackTag)
const ohosTag = ref(props.ohosTag || props.releaseTag || props.fallbackTag)
const useMirror = ref(props.enableMirror) // 是否使用镜像下载

// 计算属性
const githubUrl = computed(() => {
  return `https://github.com/${props.githubRepo}/releases`
})


// 默认平台配置
const defaultPlatforms = [
  {
    id: 'android',
    name: 'Android',
    description: '适用于 Android 10 及以上',
    links: [
      {
        label: '下载 APK',
        url: 'Kazumi_android_{tag}.apk'
      },
      {
        label: 'F-Droid',
        url: 'https://f-droid.org/packages/com.predidit.kazumi',
        external: true // 标记为外部链接
      }
    ]
  },
  {
    id: 'ios',
    name: 'iOS',
    description: '适用于 iOS/iPadOS 13 及以上',
    links: [
      {
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
        label: 'MSIX 安装包',
        url: 'Kazumi_windows_{tag}.msix'
      },
      {
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
        label: 'DEB 包',
        url: 'Kazumi_linux_{tag}_amd64.deb'
      },
      {
        label: '便携版 (TAR.GZ)',
        url: 'Kazumi_linux_{tag}_amd64.tar.gz'
      },
      {
        label: 'Flathub',
        url: 'https://flathub.org/en/apps/io.github.Predidit.Kazumi',
        external: true
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
  // 如果是外部链接，直接返回 URL
  if (link.external) {
    return link.url
  }
  
  // 确定使用的tag
  let tag = currentTag.value
  if (platform.useOhosTag) {
    tag = ohosTag.value
  }
  
  // 如果平台有单独的仓库配置，则使用该仓库
  const repo = platform.repo || props.githubRepo
  
  // 确定基础URL：如果使用镜像且不是鸿蒙仓库，则使用镜像URL
  let baseUrl
  if (useMirror.value && !platform.useOhosTag && repo === props.githubRepo) {
    // 只对主仓库使用镜像
    baseUrl = props.mirrorBaseUrl
  } else {
    baseUrl = `https://github.com/${repo}/releases/download`
  }
  
  const url = link.url.replace('{tag}', tag)
  return `${baseUrl}/${tag}/${url}`
}

const getPlatformIcon = (platformId) => {
  const icons = {
    android: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M18.44 5.559q-1.015 1.748-2.028 3.498q-.055-.023-.111-.043a12.1 12.1 0 0 0-8.68.033C7.537 8.897 5.868 6.026 5.6 5.56a1 1 0 0 0-.141-.19a1.104 1.104 0 0 0-1.768 1.298c1.947 3.37-.096-.216 1.948 3.36c.017.03-.495.263-1.393 1.017C2.9 12.176.452 14.772 0 18.99h24a11.7 11.7 0 0 0-.746-3.068a12.1 12.1 0 0 0-2.74-4.184a12 12 0 0 0-2.131-1.687c.66-1.122 1.312-2.256 1.965-3.385a1.11 1.11 0 0 0-.008-1.12a1.1 1.1 0 0 0-.852-.532c-.522-.054-.939.313-1.049.545m-.04 8.46c.395.593.324 1.331-.156 1.65c-.480.32-1.188.1-1.582-.493s-.324-1.33.156-1.65c.473-.316 1.182-.11 1.582.494m-11.193-.492c.48.32.55 1.058.156 1.65c-.394.593-1.103.815-1.584.495c-.480-.32-.55-1.058-.156-1.65c.4-.603 1.109-.811 1.584-.495"/></svg>',
    ios: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M1.1 6.05c-.614 0-1.1.48-1.1 1.08a1.08 1.08 0 0 0 1.1 1.08c.62 0 1.11-.48 1.11-1.08S1.72 6.05 1.1 6.05m7.61.02c-3.36 0-5.46 2.29-5.46 5.93c0 3.67 2.1 5.95 5.46 5.95c3.34 0 5.45-2.28 5.45-5.95c0-3.64-2.11-5.93-5.45-5.93m10.84 0c-2.5 0-4.28 1.38-4.28 3.43c0 1.63 1.01 2.65 3.13 3.14l1.49.36c1.45.33 2.04.81 2.04 1.64c0 .96-.97 1.64-2.35 1.64c-1.41 0-2.47-.69-2.58-1.75h-2c.08 2.12 1.82 3.42 4.46 3.42c2.79 0 4.54-1.37 4.54-3.55c0-1.71-1-2.68-3.32-3.21l-1.33-.3c-1.41-.34-1.99-.79-1.99-1.55c0-.96.88-1.6 2.18-1.6c1.31 0 2.21.65 2.31 1.72h1.96c-.05-2.02-1.72-3.39-4.26-3.39M8.71 7.82c2.04 0 3.35 1.63 3.35 4.18c0 2.57-1.31 4.2-3.35 4.2c-2.06 0-3.36-1.63-3.36-4.2c0-2.55 1.3-4.18 3.36-4.18M.111 9.31v8.45H2.1V9.31z"/></svg>',
    windows: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M0 0h11.377v11.372H0Zm12.623 0H24v11.372H12.623ZM0 12.623h11.377V24H0Zm12.623 0H24V24H12.623"/></svg>',
    mac: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M0 14.727h.941v-2.453c0-.484.318-.835.771-.835c.439 0 .71.276.71.722v2.566h.915V12.25c0-.48.31-.812.764-.812c.46 0 .718.28.718.77v2.518h.94v-2.748c0-.801-.517-1.334-1.307-1.334c-.578 0-1.054.31-1.247.805h-.023c-.147-.514-.552-.805-1.118-.805c-.545 0-.968.306-1.142.771H.903v-.695H0v4.006zm7.82-.646c-.408 0-.68-.208-.68-.537c0-.318.26-.522.714-.552l.926-.057v.307c0 .483-.427.839-.96.839m-.284.71c.514 0 1.017-.268 1.248-.703h.018v.639h.908v-2.76c0-.804-.647-1.33-1.64-1.33c-1.021 0-1.66.537-1.701 1.285h.873c.06-.332.344-.548.79-.548c.464 0 .748.242.748.662v.287l-1.058.06c-.976.061-1.524.488-1.524 1.199c0 .721.564 1.209 1.338 1.209m6.305-2.642c-.065-.843-.719-1.512-1.777-1.512c-1.164 0-1.92.805-1.92 2.087c0 1.3.756 2.082 1.928 2.082c1.005 0 1.697-.590 1.772-1.485h-.888c-.087.453-.397.725-.873.725c-.597 0-.982-.483-.982-1.322c0-.824.381-1.323.975-1.323c.502 0 .8.321.876.748zm2.906-2.967c-1.591 0-2.589 1.085-2.589 2.82s.998 2.816 2.59 2.816c1.586 0 2.584-1.081 2.584-2.816s-.997-2.82-2.585-2.82m0 .832c.971 0 1.591.77 1.591 1.988c0 1.213-.62 1.984-1.59 1.984c-.976 0-1.592-.770-1.592-1.984c0-1.217.616-1.988 1.591-1.988m2.982 3.178c.042 1.006.866 1.626 2.12 1.626c1.32 0 2.151-.65 2.151-1.686c0-.813-.469-1.27-1.576-1.523l-.627-.144c-.67-.158-.945-.37-.945-.733c0-.453.415-.756 1.032-.756c.623 0 1.05.306 1.096.817h.93c-.023-.96-.817-1.61-2.019-1.61c-1.187 0-2.03.653-2.03 1.62c0 .78.477 1.263 1.482 1.494l.707.166c.688.163.967.39.967.782c0 .454-.457.779-1.115.779c-.665 0-1.167-.329-1.228-.832z"/></svg>',
    linux: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M12.504 0q-.232 0-.48.021c-4.226.333-3.105 4.807-3.17 6.298c-.076 1.092-.3 1.953-1.05 3.02c-.885 1.051-2.127 2.75-2.716 4.521c-.278.832-.41 1.684-.287 2.489a.4.4 0 0 0-.11.135c-.26.268-.45.6-.663.839c-.199.199-.485.267-.797.4c-.313.136-.658.269-.864.68c-.09.189-.136.394-.132.602c0 .199.027.4.055.536c.058.399.116.728.04.97c-.249.68-.28 1.145-.106 1.484c.174.334.535.47.94.601c.81.2 1.91.135 2.774.6c.926.466 1.866.67 2.616.47c.526-.116.97-.464 1.208-.946c.587-.003 1.23-.269 2.26-.334c.699-.058 1.574.267 2.577.2c.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071s1.592-.536 2.257-1.306c.631-.765 1.683-1.084 2.378-1.503c.348-.199.629-.469.649-.853c.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926c-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.36.36 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694c-.533-1.41-1.465-2.638-2.175-3.483c-.796-1.005-1.576-1.957-1.56-3.368c.026-2.152.236-6.133-3.544-6.139m.529 3.405h.013c.213 0 .396.062.584.198c.19.135.33.332.438.533c.105.259.158.459.166.724c0-.02.006-.04.006-.06v.105l-.004-.021l-.004-.024a1.8 1.8 0 0 1-.15.706a.95.95 0 0 1-.213.335a1 1 0 0 0-.088-.042c-.104-.045-.198-.064-.284-.133a1.3 1.3 0 0 0-.22-.066c.05-.06.146-.133.183-.198q.08-.193.088-.402v-.02a1.2 1.2 0 0 0-.061-.4c-.045-.134-.101-.2-.183-.333c-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 0 0-.205.334a1.2 1.2 0 0 0-.09.4v.019q.002.134.02.267c-.193-.067-.438-.135-.607-.202a2 2 0 0 1-.018-.2v-.02a1.8 1.8 0 0 1 .15-.768a1.08 1.08 0 0 1 .43-.533a1 1 0 0 1 .594-.2zm-2.962.059h.036c.142 0 .27.048.399.135c.146.129.264.288.344.465c.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024c-.152.055-.274.135-.393.2q.018-.136.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.6.6 0 0 0-.166-.267a.25.25 0 0 0-.183-.064h-.021c-.071.006-.13.04-.186.132a.55.55 0 0 0-.12.27a1 1 0 0 0-.023.33v.015c.012.135.037.2.08.334c.046.134.098.2.166.268q.014.014.034.024c-.07.057-.117.07-.176.136a.3.3 0 0 1-.131.068a2.6 2.6 0 0 1-.275-.402a1.8 1.8 0 0 1-.155-.667a1.8 1.8 0 0 1 .08-.668a1.4 1.4 0 0 1 .283-.535c.128-.133.26-.2.418-.2m1.37 1.706c.332 0 .733.065 1.216.399c.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.57.57 0 0 1 .016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465c-.276.135-.588.292-1.012.267a1.1 1.1 0 0 1-.448-.067a4 4 0 0 1-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71q-.104-.403.193-.6c.224-.135.38-.271.483-.336c.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601c.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473c.286.534.855 1.659 1.102 3.024c.156-.005.33.018.513.064c.646-1.671-.546-3.467-1.089-3.966c-.22-.2-.232-.335-.123-.335c.59.534 1.365 1.572 1.646 2.757c.13.535.16 1.104.021 1.67c.067.028.135.06.205.067c1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224c-.915-.4-1.646-.336-1.77.465c-.008.043-.013.066-.018.135c-.068.023-.139.053-.209.064c-.43.268-.662.669-.793 1.187c-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35c-1.5 1.072-3.58 1.538-5.348.334a2.7 2.7 0 0 0-.402-.533a1.5 1.5 0 0 0-.275-.333c.182 0 .338-.03.465-.067a.62.62 0 0 0 .314-.334c.108-.267 0-.697-.345-1.163s-.931-.995-1.788-1.521c-.63-.4-.986-.87-1.15-1.396c-.165-.534-.143-1.085-.015-1.645c.245-1.07.873-2.11 1.274-2.763c.107-.065.037.135-.408.974c-.396.751-1.14 2.497-.122 3.854a8.1 8.1 0 0 1 .647-2.876c.564-1.278 1.743-3.504 1.836-5.268c.048.036.217.135.289.202c.218.133.38.333.59.465c.21.201.477.335.876.335q.058.005.11.006c.412 0 .73-.134.997-.268c.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377c.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876c.085.4.154.78.409 1.066c.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595c-.63.401-1.746.712-2.457 1.57c-.618.737-1.37 1.14-2.036 1.191c-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69c.176-.668.428-1.344.463-1.897c.037-.714.076-1.335.195-1.814c.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01q.08 0 .157.014c.376.055.706.333 1.023.752l.91 1.664l.003.003c.243.533.754 1.064 1.189 1.637c.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294c-.645.135-1.52.002-2.395-.464c-.968-.536-2.118-.469-2.857-.602q-.553-.1-.723-.4c-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118c-.055-.401-.083-.71.043-.94c.16-.334.396-.4.69-.533c.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838c.19-.201.38-.336.663-.336m7.159-9.074c-.435.201-.945.535-1.488.535c-.542 0-.97-.267-1.28-.466c-.154-.134-.28-.268-.373-.335c-.164-.134-.144-.333-.074-.333c.109.016.129.134.199.2c.096.066.215.2.36.333c.292.2.68.467 1.167.467c.485 0 1.053-.267 1.398-.466c.195-.135.445-.334.648-.467c.156-.136.149-.267.279-.267c.128.016.034.134-.147.332a8 8 0 0 1-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05c.074-.043.18-.027.26.004c.063 0 .16.067.15.135c-.006.049-.085.066-.135.066c-.055 0-.092-.043-.141-.068c-.052-.018-.146-.008-.163-.065m-.551 0c-.02.058-.113.049-.166.066c-.047.025-.086.068-.14.068c-.05 0-.13-.02-.136-.068c-.01-.066.088-.133.15-.133c.08-.031.184-.047.259-.005c.019.009.036.03.03.05v.02h.003z"/></svg>',
    ohos: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M1.861 0H3.59v3.548h3.861V0H9.19v8.883H7.458V5.136H3.59v3.746H1.858Zm11.993 0h1.706l2.809 4.7h.1L21.278 0h1.719v8.883h-1.719v-4.38l.1-1.489h-.1l-2.334 3.983h-1.039l-2.347-3.983h-.1l.1 1.489v4.38h-1.706Zm4.702 21.648a4 4 0 0 1-1.154-.161a3.4 3.4 0 0 1-1.01-.484a3.5 3.5 0 0 1-.8-.782a3.8 3.8 0 0 1-.538-1.092l1.666-.62a2.4 2.4 0 0 0 .643 1.116a1.68 1.68 0 0 0 1.207.434a2.2 2.2 0 0 0 .524-.062a1.8 1.8 0 0 0 .459-.2a1 1 0 0 0 .328-.335a.9.9 0 0 0 .118-.459a1.05 1.05 0 0 0-.092-.447a1 1 0 0 0-.315-.373a2.5 2.5 0 0 0-.564-.335a8 8 0 0 0-.852-.335l-.577-.2a5 5 0 0 1-.774-.335a3.4 3.4 0 0 1-.7-.509a2.7 2.7 0 0 1-.525-.695a2.1 2.1 0 0 1-.2-.918a2.25 2.25 0 0 1 .21-.968a2.4 2.4 0 0 1 .616-.794a2.9 2.9 0 0 1 .957-.533a3.7 3.7 0 0 1 1.246-.2a3.6 3.6 0 0 1 1.22.186a2.8 2.8 0 0 1 .879.459a2.5 2.5 0 0 1 .59.608a3 3 0 0 1 .328.633l-1.56.62a1.55 1.55 0 0 0-.485-.67a1.4 1.4 0 0 0-.944-.3a1.66 1.66 0 0 0-.957.261a.75.75 0 0 0-.38.658a.84.84 0 0 0 .367.682a4.2 4.2 0 0 0 1.167.534l.59.186a6.3 6.3 0 0 1 1.023.434a3 3 0 0 1 .8.57a2.2 2.2 0 0 1 .511.769a2.4 2.4 0 0 1 .183.98a2.3 2.3 0 0 1-.3 1.2a2.6 2.6 0 0 1-.747.819a3.4 3.4 0 0 1-1.036.484a4.2 4.2 0 0 1-1.128.161Zm-13.028 0a4.44 4.44 0 0 1-3.23-1.34a4.8 4.8 0 0 1-.956-1.476a4.9 4.9 0 0 1-.339-1.824a4.8 4.8 0 0 1 .339-1.811a4.6 4.6 0 0 1 .956-1.477a4.4 4.4 0 0 1 1.427-.992a4.5 4.5 0 0 1 1.8-.36a4.4 4.4 0 0 1 1.79.36a4.3 4.3 0 0 1 1.44.992a4.4 4.4 0 0 1 .944 1.477a4.7 4.7 0 0 1 .351 1.811a4.8 4.8 0 0 1-.351 1.824a4.6 4.6 0 0 1-.944 1.476a4.5 4.5 0 0 1-3.23 1.34Zm0-1.588a2.8 2.8 0 0 0 1.125-.223a2.8 2.8 0 0 0 .92-.621a2.7 2.7 0 0 0 .617-.955a3.3 3.3 0 0 0 .23-1.253a3.2 3.2 0 0 0-.23-1.24a2.7 2.7 0 0 0-.617-.968a2.8 2.8 0 0 0-.92-.62a2.8 2.8 0 0 0-1.125-.223a2.86 2.86 0 0 0-2.057.844a3 3 0 0 0-.617.968a3.4 3.4 0 0 0-.218 1.24a3.5 3.5 0 0 0 .218 1.253a3 3 0 0 0 .617.955a2.86 2.86 0 0 0 2.057.843m-3.297 2.428h6.5V24h-6.5Z"/></svg>'
  }
  return icons[platformId] || '📦'
}


// 从文件获取release信息
const fetchFromFile = async () => {
  try {
    const response = await fetch(props.releasesFile)
    if (!response.ok) {
      throw new Error(`文件加载失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 验证数据结构
    if (data.kazumi && data.kazumi.tag) {
      currentTag.value = data.kazumi.tag
      latestTag.value = data.kazumi.tag
    }
    
    if (data.ohos && data.ohos.tag) {
      ohosTag.value = data.ohos.tag
    }
    
    return true
  } catch (err) {
    // 文件获取失败，使用fallback
    error.value = `无法加载版本信息: ${err.message}`
    currentTag.value = props.fallbackTag
    ohosTag.value = props.ohosTag || props.fallbackTag
    return false
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
    
    // 只从文件获取版本信息
    await fetchFromFile()
    
  } catch (err) {
    error.value = err.message
    currentTag.value = props.fallbackTag
    ohosTag.value = props.ohosTag || props.fallbackTag
  } finally {
    loading.value = false
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
  fetchLatestRelease()
})

watch(() => props.ohosRepo, () => {
  // 更新鸿蒙仓库配置
  defaultPlatforms.find(p => p.id === 'ohos').repo = props.ohosRepo
  fetchLatestRelease()
})

watch(() => props.ohosTag, (newTag) => {
  if (newTag) {
    ohosTag.value = newTag
  }
})

// 生命周期
onMounted(() => {
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
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
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

/* 镜像开关 */
.mirror-switch {
  margin-bottom: 1.5rem;
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
}
</style>