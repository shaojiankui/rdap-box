<template>
    <div class="page-wrapper">
      <div class="page-container">
        <HeroMarquee class="background-marquee" />
        <div class="content-container">
          <div class="hero-section">
            <h1 class="hero-title">
              快速 <span class="highlight">RDAP</span> 查询
            </h1>
            <p class="hero-subtitle">支持 1500+ 顶级域名的 RDAP 查询服务 <br>让全球后缀都支持RDAP协议</p>
          </div>
  
          <div class="search-section" :class="{sticky: result}">
            <div class="search-box">
              <input
                v-model="domain"
                type="text"
                placeholder="输入域名，例如：example.com"
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <button
                v-if="domain"
                class="clear-button"
                @click="clearSearch"
                type="button"
                title="清空"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                class="search-button"
                @click="handleSearch"
                :disabled="loading"
              >
                {{ loading ? '查询中...' : '查询' }}
              </button>
            </div>
  
            <!-- 查询记录 -->
            <div
              v-if="!result && !loading && !error && searchHistory.length > 0"
              class="search-history"
            >
              <div class="history-tags">
                <button
                  v-for="(item, index) in searchHistory"
                  :key="index"
                  class="history-tag"
                  @click="selectHistory(item)"
                >
                  <svg
                    class="tag-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span class="tag-text">{{ item }}</span>
                </button>
              </div>
            </div>
          </div>
  
          <div v-if="error" class="error-message">
            <div class="error-content">
              <svg
                class="error-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>
  
          <Info
            v-if="result"
            :key="result.handle || result.ldhName || domain"
            :data="result"
            :source="result.remarks?.some((r: any) => r.title === 'Data Source' && r.description?.includes('WHOIS')) ? 'whois' : 'rdap'"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
  const domain = ref('')
  const loading = ref(false)
  const error = ref('')
  const result = ref<any>(null)
  const searchHistory = ref<string[]>([])
  const MAX_HISTORY = 20

  // 从路由参数获取域名并解码
  const getDomainFromRoute = () => {
    const domainParam = route.params.domain as string
    if (domainParam) {
      // 解码 URL 编码的域名（如 example%2Ecom -> example.com）
      return decodeURIComponent(domainParam)
    }
    return ''
  }
  
  // 从 localStorage 加载查询记录
  const loadHistory = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('rdap-search-history')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            searchHistory.value = parsed
            console.log('Loaded search history:', searchHistory.value)
          }
        }
      } catch (e) {
        console.error('Failed to load search history:', e)
        searchHistory.value = []
      }
    }
  }
  
  // 保存查询记录到 localStorage
  const saveHistory = (domainValue: string) => {
    if (process.client) {
      try {
        const trimmed = domainValue.trim()
        if (!trimmed) return
  
        const trimmedLower = trimmed.toLowerCase()
  
        // 移除重复项（不区分大小写）
        let history = searchHistory.value.filter(
          (item) => item.toLowerCase() !== trimmedLower
        )
  
        // 添加到开头
        history.unshift(trimmed)
  
        // 限制数量
        history = history.slice(0, MAX_HISTORY)
  
        searchHistory.value = history
        localStorage.setItem('rdap-search-history', JSON.stringify(history))
        console.log('Saved search history:', history)
      } catch (e) {
        console.error('Failed to save search history:', e)
      }
    }
  }
  
  // 清除查询记录
  const clearHistory = () => {
    searchHistory.value = []
    if (process.client) {
      try {
        localStorage.removeItem('rdap-search-history')
      } catch (e) {
        console.error('Failed to clear search history:', e)
      }
    }
  }
  
  // 选择历史记录
  const selectHistory = (domainValue: string) => {
    domain.value = domainValue
    handleSearch()
  }
  
  // 清空搜索
  const clearSearch = () => {
    domain.value = ''
    result.value = null
    error.value = ''
    // 如果在动态路由页面，导航回首页
    if (route.params.domain) {
      navigateTo('/')
    }
  }
  
  const handleSearch = async () => {
    if (!domain.value.trim()) {
      error.value = '请输入域名'
      result.value = null
      return
    }
  
    loading.value = true
    error.value = ''
    result.value = null
  
    const domainToQuery = domain.value.trim()
  
    try {
      const response = await $fetch(`/domain/${domainToQuery}`)
      console.log('API Response:', response)
      result.value = response
  
      // 保存查询记录（只有成功时才保存）
      if (response && response.objectClassName) {
        saveHistory(domainToQuery)
        console.log('Current history after save:', searchHistory.value)
        // 更新 URL（如果域名改变）
        const routeDomain = getDomainFromRoute()
        if (domainToQuery !== routeDomain) {
          navigateTo(`/${encodeURIComponent(domainToQuery)}`)
        }
        // 滚动到结果区域
        setTimeout(() => {
          window.scrollTo({top: 0, behavior: 'smooth'})
        }, 100)
      } else {
        console.warn('Query succeeded but no result data, not saving to history')
      }
    } catch (e: any) {
      console.error('Query error:', e)
      error.value = e.data?.message || e.message || '查询失败，请检查域名是否正确'
      result.value = null
    } finally {
      loading.value = false
    }
  }
  
  // 组件挂载时加载历史记录并自动查询路由中的域名
  onMounted(() => {
    loadHistory()

    // 从路由参数获取域名并自动查询
    const routeDomain = getDomainFromRoute()
    if (routeDomain) {
      domain.value = routeDomain
      handleSearch()
    }

    // 调试：检查 localStorage
    if (process.client) {
      const stored = localStorage.getItem('rdap-search-history')
      console.log('LocalStorage check on mount:', {
        stored,
        parsed: stored ? JSON.parse(stored) : null,
        searchHistoryLength: searchHistory.value.length,
      })
    }
  })

  // 监听路由变化，如果域名参数改变则自动查询
  watch(() => route.params.domain, (newDomain) => {
    if (newDomain) {
      const decodedDomain = decodeURIComponent(newDomain as string)
      if (decodedDomain !== domain.value) {
        domain.value = decodedDomain
        handleSearch()
      }
    }
  })
  </script>
  
  <style scoped>
  .page-wrapper {
    flex: 1;
    background: #030617;
    min-height: 600px; /* 防止内容过少时被压瘪 */
    width: 100%;
  }
  
  .page-container {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .background-marquee {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 0;
    pointer-events: none;
  }
  .content-container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding-top: 7rem;
    position: relative;
    z-index: 1;
  }
  
  .hero-section {
    text-align: center;
    margin: 0 auto 2rem;
    width: 100%;
    position: relative;
  }
  
  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }
  
  .highlight {
    color: #00dc82;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #94a3b8;
    line-height: 1.6;
  }
  
  .search-section {
    width: 100%;
    position: relative;
  }
  
  .search-section.sticky {
    position: sticky;
    top: 80px;
    background: rgba(3, 6, 23, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
  
  /* 查询记录样式 */
  .search-history {
    margin-top: 1rem;
  }
  
  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    row-gap: 0.625rem;
  }
  
  .history-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    line-height: 1;
  }
  
  .history-tag:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .history-tag:active {
    transform: translateY(0);
  }
  
  .tag-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.7;
  }
  
  .history-tag:hover .tag-icon {
    opacity: 1;
  }
  
  .tag-text {
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(10, 14, 32, 0.9);
    padding: 0.375rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  .search-box:focus-within {
    border-color: #00dc82;
    box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1);
  }
  
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 1.125rem;
    padding: 0.625rem 1rem;
  }
  
  .search-input::placeholder {
    color: #64748b;
  }
  
  .clear-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    align-self: center;
  }
  
  .clear-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  .clear-button svg {
    width: 18px;
    height: 18px;
  }
  
  .search-button {
    background: #00dc82;
    color: #020420;
    border: none;
    padding: 0.625rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  
  .search-button:hover:not(:disabled) {
    background: #00f593;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 220, 130, 0.3);
  }
  
  .search-button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .search-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .error-message {
    width: 100%;
    margin: 0 0 2rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 1rem;
    position: relative;
  }
  
  .error-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #fca5a5;
  }
  
  .error-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-container {
      padding: 2rem 1rem;
    }
  
    .content-container {
      padding-top: 4rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  
    .hero-title {
      font-size: 2.5rem;
    }
  
    .hero-subtitle {
      font-size: 1rem;
    }
  
    .search-box {
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .search-button {
      width: 100%;
    }
  
    .search-section.sticky {
      top: 70px;
      padding: 0.5rem;
    }
  
    .search-history {
      margin-top: 1rem;
      padding-top: 1rem;
    }
  
    .history-tags {
      gap: 0.5rem;
      row-gap: 0.5rem;
    }
  
    .history-tag {
      padding: 0.375rem 0.625rem;
      font-size: 0.75rem;
    }
  
    .tag-icon {
      width: 12px;
      height: 12px;
    }
  }
  </style>
  