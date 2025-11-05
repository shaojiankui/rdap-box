<template>
    <div class="hero-marquee">
        <!-- Gradient SVG Overlay -->
        <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="gradient-overlay">
            <mask id="path-1-inside-1" fill="white">
                <path d="M0 0H1440V181H0V0Z"></path>
            </mask>
            <path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear)" fill-opacity="0.22"></path>
            <path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear)" mask="url(#path-1-inside-1)"></path>
            <defs>
                <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse">
                    <stop stop-color="currentColor"></stop>
                    <stop offset="1" stop-color="currentColor" stop-opacity="0"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="currentColor" stop-opacity="0"></stop>
                    <stop offset="0.395" stop-color="currentColor"></stop>
                    <stop offset="1" stop-color="currentColor" stop-opacity="0"></stop>
                </linearGradient>
            </defs>
        </svg>

        <div class="marquee-container">
            <!-- Row 1: Left to Right -->
            <div class="marquee-row">
                <div class="marquee-content">
                    <div class="marquee-track" :style="{ animationDuration: '80s' }">
                        <div v-for="(item, index) in row1Icons" :key="`row1-set1-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="marquee-track" :style="{ animationDuration: '80s' }">
                        <div v-for="(item, index) in row1Icons" :key="`row1-set2-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Row 2: Right to Left (reverse) -->
            <div class="marquee-row reverse">
                <div class="marquee-content">
                    <div class="marquee-track" :style="{ animationDuration: '90s' }">
                        <div v-for="(item, index) in row2Icons" :key="`row2-set1-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="marquee-track" :style="{ animationDuration: '90s' }">
                        <div v-for="(item, index) in row2Icons" :key="`row2-set2-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Row 3: Left to Right -->
            <div class="marquee-row">
                <div class="marquee-content">
                    <div class="marquee-track" :style="{ animationDuration: '110s' }">
                        <div v-for="(item, index) in row3Icons" :key="`row3-set1-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="marquee-track" :style="{ animationDuration: '110s' }">
                        <div v-for="(item, index) in row3Icons" :key="`row3-set2-${index}`" class="icon-card">
                            <div class="icon-content">
                                <span class="tld-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Row 1: Popular generic TLDs
const row1Icons = [
    'COM', 'NET', 'ORG', 'IO', 'DEV', 'APP', 'CLOUD', 'AI', 'TECH', 'ONLINE',
    'SITE', 'STORE', 'BLOG', 'INFO', 'XYZ', 'CO', 'DIGITAL', 'WORLD', 'SPACE', 'LIVE',
    'PRO', 'ZONE', 'WEB', 'LINK'
]

// Row 2: Country code TLDs (Asia, Europe, Americas)
const row2Icons = [
    'US', 'UK', 'CN', 'DE', 'JP', 'FR', 'AU', 'CA', 'RU', 'NL',
    'BR', 'ES', 'IT', 'IN', 'MX', 'SE', 'NO', 'DK', 'FI', 'NZ',
    'SG', 'HK', 'TW', 'KR', 'CH', 'AT'
]

// Row 3: Business and industry TLDs
const row3Icons = [
    'DESIGN', 'STUDIO', 'ACADEMY', 'EMAIL', 'NETWORK', 'SOLUTIONS', 'SERVICES', 'EXPERT',
    'GLOBAL', 'MEDIA', 'AGENCY', 'SYSTEMS', 'TECHNOLOGY', 'CENTER', 'COMPANY', 'BUSINESS',
    'GROUP', 'TEAM', 'WORKS', 'LAB', 'VENTURES', 'PARTNERS'
]
</script>

<style scoped>
.hero-marquee {
    position: relative;
    width: 100%;
    overflow: hidden;
    opacity: 0.6;
}

/* 底部渐变遮罩 */
.hero-marquee::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to top,
        #020420 0%,
        rgba(2, 4, 32, 0.85) 20%,
        rgba(2, 4, 32, 0.5) 50%,
        transparent 100%
    );
    pointer-events: none;
    z-index: 15;
}

.gradient-overlay {
    pointer-events: none;
    position: absolute;
    width: 100%;
    top: -1px;
    transition: all 0.4s ease;
    color: #00DC82;
    flex-shrink: 0;
    z-index: 1;
    opacity: 0.5;
}

.marquee-container {
    width: 100%;
    overflow: hidden;
    padding: 2rem 0;
}

.marquee-row {
    position: relative;
    overflow: hidden;
    margin-bottom: 2.5rem;
}

.marquee-row:last-child {
    margin-bottom: 0;
}

/* 左右渐变蒙版 - V形淡出效果 */
.marquee-row::before,
.marquee-row::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 300px;
    z-index: 10;
    pointer-events: none;
}

.marquee-row::before {
    left: 0;
    background: linear-gradient(to right, 
        #020420 0%,
        rgba(2, 4, 32, 0.98) 8%,
        rgba(2, 4, 32, 0.9) 20%,
        rgba(2, 4, 32, 0.65) 40%,
        rgba(2, 4, 32, 0.35) 70%,
        transparent 100%
    );
}

.marquee-row::after {
    right: 0;
    background: linear-gradient(to left, 
        #020420 0%,
        rgba(2, 4, 32, 0.98) 8%,
        rgba(2, 4, 32, 0.9) 20%,
        rgba(2, 4, 32, 0.65) 40%,
        rgba(2, 4, 32, 0.35) 70%,
        transparent 100%
    );
}

.marquee-content {
    display: flex;
    gap: 0.875rem;
    width: max-content;
}

.marquee-track {
    display: flex;
    gap: 0.875rem;
    animation: marquee 120s linear infinite;
    will-change: transform;
}

/* Reverse direction for alternate rows */
.marquee-row.reverse .marquee-track {
    animation-name: marquee-reverse;
}

@keyframes marquee {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-100%);
    }
}

@keyframes marquee-reverse {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(0);
    }
}

.icon-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 4.5rem;
    height: 2.75rem;
    border-radius: 1.375rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 220, 130, 0.05);
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.icon-card:hover {
    background: rgba(0, 220, 130, 0.15);
    border-color: rgba(0, 220, 130, 0.4);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 220, 130, 0.3);
    z-index: 20;
    position: relative;
}

.icon-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.tld-text {
    font-size: 0.75rem;
    font-weight: 700;
    color: #00DC82;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    user-select: none;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .marquee-container {
        padding: 0.25rem 0;
    }

    .marquee-row {
        margin-bottom: 1.75rem;
    }

    .marquee-row::before,
    .marquee-row::after {
        width: 120px;
    }

    .icon-card {
        min-width: 3.5rem;
        height: 2.25rem;
        border-radius: 1.125rem;
        padding: 0.375rem 0.75rem;
    }

    .tld-text {
        font-size: 0.625rem;
        letter-spacing: 0.3px;
    }

    .marquee-track {
        gap: 0.625rem;
    }

    .marquee-content {
        gap: 0.625rem;
    }
}

/* Pause animation on hover for better UX */
.marquee-row:hover .marquee-track {
    animation-play-state: paused;
}
</style>
