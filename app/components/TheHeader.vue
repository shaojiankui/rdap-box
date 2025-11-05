<template>
    <header class="header" :class="{ 'header-scrolled': isScrolled }">
        <div class="header-container">
            <div class="logo">
                <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span class="logo-text">RDAP Box</span>
            </div>
            
            <nav class="nav">
                <a href="/" class="nav-link active">首页</a>
                <!-- <a href="https://github.com/icann/rdap-conformance" target="_blank" class="nav-link">文档</a> -->
                <a href="https://www.iana.org/assignments/rdap-dns/rdap-dns.xhtml" target="_blank" class="nav-link">RDAP 服务器</a>
            </nav>

            <div class="header-actions">
                <a href="https://github.com" target="_blank" class="github-link" aria-label="GitHub">
                    <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
const isScrolled = ref(false)

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
    background: #030617;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    position: sticky;
    top: 0;
    z-index: 50;
    transition: all 0.3s ease;
}

.header-scrolled {
    background: #030617;
    border-bottom-color: rgba(148, 163, 184, 0.2);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
}

.header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: opacity 0.2s;
}

.logo:hover {
    opacity: 0.8;
}

.logo-icon {
    width: 32px;
    height: 32px;
    color: #00DC82;
}

.logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
}

.nav {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.9375rem;
    transition: color 0.2s;
}

.nav-link:hover {
    color: #fff;
}

.nav-link.active {
    color: #00DC82;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    color: #94a3b8;
    transition: all 0.2s;
}

.github-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
}

.github-icon {
    width: 20px;
    height: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .header-container {
        padding: 0 1rem;
    }

    .nav {
        display: none;
    }

    .logo-text {
        font-size: 1.125rem;
    }

    .logo-icon {
        width: 28px;
        height: 28px;
    }
}
</style>