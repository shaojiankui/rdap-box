<template>
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="copyright">
                    © {{ currentYear }} RDAP Box. 基于 <a href="https://nuxt.com" target="_blank" class="nuxt-link">Nuxt</a> 构建
                </div>

                <div class="footer-social">
                    <a href="https://github.com" target="_blank" class="social-link" aria-label="GitHub">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" class="social-link" aria-label="Twitter">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
    background: #030617;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    padding: 2rem 0 1.5rem;
}

.footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.copyright {
    color: #64748b;
    font-size: 0.8125rem;
}

.footer-social {
    display: flex;
    gap: 0.75rem;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    color: #64748b;
    transition: all 0.2s;
}

.social-link:hover {
    color: #00DC82;
    background: rgba(0, 220, 130, 0.1);
}

.social-link svg {
    width: 18px;
    height: 18px;
}

.nuxt-link {
    color: #00DC82;
    font-weight: 600;
    transition: opacity 0.2s;
}

.nuxt-link:hover {
    opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .footer-container {
        padding: 0 1rem;
    }

    .footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .footer-social {
        order: -1;
    }
}
</style>