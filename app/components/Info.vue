<template>
    <div class="info-container">
        <div class="info-sections">
            <!-- Details Section -->
            <div v-if="data.objectClassName || data.handle || data.ldhName || data.unicodeName || data.secureDNS || data.status || (data.links && data.links.length)" class="info-section">
                <div class="section-header" :class="{ 'collapsed': !expandedSections.details }" @click="toggleSection('details')">
                    <h3 class="section-title">Details</h3>
                </div>
                <div v-if="expandedSections.details" class="section-content">
                    <div v-if="data.objectClassName" class="info-item">
                        <span class="info-label">Object class name:</span>
                        <span class="info-value">{{ data.objectClassName }}</span>
                    </div>
                    <div v-if="data.handle" class="info-item">
                        <span class="info-label">Handle:</span>
                        <span class="info-value">{{ data.handle }}</span>
                    </div>
                    <div v-if="data.ldhName" class="info-item">
                        <span class="info-label">LDH name:</span>
                        <span class="info-value">{{ data.ldhName }}</span>
                    </div>
                    <div v-if="data.unicodeName" class="info-item">
                        <span class="info-label">Unicode name:</span>
                        <span class="info-value">{{ data.unicodeName }}</span>
                    </div>
                    <div v-if="data.secureDNS" class="info-item">
                        <span class="info-label">Secure DNS delegation signed:</span>
                        <span class="info-value">{{ data.secureDNS.delegationSigned ? 'Yes' : 'No' }}</span>
                    </div>
                    <div v-if="data.status" class="info-item">
                        <span class="info-label">Status:</span>
                        <div class="status-tags">
                            <span v-for="(status, index) in data.status" :key="index" class="status-tag">{{ status }}</span>
                        </div>
                    </div>
                    <div v-if="data.links && data.links.length" class="info-item">
                        <div class="info-url">
                            <a :href="data.links[0].value" target="_blank" class="url-link">{{ data.links[0].value }}</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Events Section -->
            <div v-if="data.events && data.events.length" class="info-section">
                <div class="section-header" :class="{ 'collapsed': !expandedSections.events }" @click="toggleSection('events')">
                    <h3 class="section-title">Events</h3>
                </div>
                <div v-if="expandedSections.events" class="section-content">
                    <div v-for="(event, index) in data.events" :key="index" class="info-item">
                        <span class="info-label">{{ formatEventAction(event.eventAction) }}:</span>
                        <span class="info-value">{{ formatDate(event.eventDate) }}</span>
                    </div>
                </div>
            </div>

            <!-- Entities Section -->
            <div v-if="data.entities && data.entities.length" class="info-section">
                <div class="section-header" :class="{ 'collapsed': !expandedSections.entities }" @click="toggleSection('entities')">
                    <h3 class="section-title">Entities</h3>
                </div>
                <div v-if="expandedSections.entities" class="section-content">
                    <div v-for="(entity, index) in data.entities" :key="index" class="entity-item">
                        <div class="entity-header" @click="toggleEntity(index)">
                            <svg class="entity-icon" :class="{ 'expanded': expandedEntities[index] }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path v-if="expandedEntities[index]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span class="entity-handle">{{ entity.handle }}</span>
                            <span v-if="entity.roles && entity.roles.length" class="entity-roles">
                                <span class="entity-role-text">({{ entity.roles.join(', ') }})</span>
                            </span>
                        </div>
                        <div v-if="expandedEntities[index]" class="entity-details">
                            <div v-if="entity.objectClassName" class="info-item">
                                <span class="info-label">Object class name:</span>
                                <span class="info-value">{{ entity.objectClassName }}</span>
                            </div>
                            <div v-if="entity.handle" class="info-item">
                                <span class="info-label">Handle:</span>
                                <span class="info-value">{{ entity.handle }}</span>
                            </div>
                            <template v-if="entity.vcardArray && entity.vcardArray.length > 1">
                                <div v-for="(vcard, vcardIndex) in entity.vcardArray[1]" :key="vcardIndex">
                                    <div v-if="Array.isArray(vcard) && vcard[0] === 'fn'" class="info-item">
                                        <span class="info-label">Fn:</span>
                                        <span class="info-value">{{ Array.isArray(vcard[3]) ? vcard[3][0] : vcard[3] }}</span>
                                    </div>
                                    <div v-if="Array.isArray(vcard) && vcard[0] === 'tel'" class="info-item">
                                        <span class="info-label">Tel:</span>
                                        <span class="info-value">{{ Array.isArray(vcard[3]) ? vcard[3][0] : vcard[3] }}</span>
                                    </div>
                                    <div v-if="Array.isArray(vcard) && vcard[0] === 'email'" class="info-item">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">{{ Array.isArray(vcard[3]) ? vcard[3][0] : vcard[3] }}</span>
                                    </div>
                                </div>
                            </template>
                            <div v-if="entity.roles && entity.roles.length" class="info-item">
                                <span class="info-label">Roles:</span>
                                <div class="status-tags">
                                    <span v-for="(role, roleIndex) in entity.roles" :key="roleIndex" class="role-tag">{{ role }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nameservers Section -->
            <div v-if="data.nameservers && data.nameservers.length" class="info-section">
                <div class="section-header" :class="{ 'collapsed': !expandedSections.nameservers }" @click="toggleSection('nameservers')">
                    <h3 class="section-title">Nameservers</h3>
                </div>
                <div v-if="expandedSections.nameservers" class="section-content">
                    <div v-for="(nameserver, index) in data.nameservers" :key="index" class="nameserver-item">
                        <div class="nameserver-header" @click="toggleNameserver(index)">
                            <svg class="nameserver-icon" :class="{ 'expanded': expandedNameservers[index] }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path v-if="expandedNameservers[index]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span class="nameserver-name">{{ nameserver.ldhName || nameserver.handle }}</span>
                        </div>
                        <div v-if="expandedNameservers[index]" class="nameserver-details">
                            <div v-if="nameserver.objectClassName" class="info-item">
                                <span class="info-label">Object class name:</span>
                                <span class="info-value">{{ nameserver.objectClassName }}</span>
                            </div>
                            <div v-if="nameserver.ldhName" class="info-item">
                                <span class="info-label">LDH name:</span>
                                <span class="info-value">{{ nameserver.ldhName }}</span>
                            </div>
                            <div v-if="nameserver.unicodeName" class="info-item">
                                <span class="info-label">Unicode name:</span>
                                <span class="info-value">{{ nameserver.unicodeName }}</span>
                            </div>
                            <div v-if="nameserver.status && nameserver.status.length" class="info-item">
                                <span class="info-label">Status:</span>
                                <div class="status-tags">
                                    <span v-for="(status, statusIndex) in nameserver.status" :key="statusIndex" class="status-tag">{{ status }}</span>
                                </div>
                            </div>
                            <!-- <div v-if="nameserver.links && nameserver.links.length" class="info-item">
                                <div class="info-url">
                                    <a :href="nameserver.links[0].value" target="_blank" class="url-link">{{ nameserver.links[0].value }}</a>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notices Section -->
            <div v-if="data.notices && data.notices.length" class="info-section">
                <div class="section-header" :class="{ 'collapsed': !expandedSections.notices }" @click="toggleSection('notices')">
                    <h3 class="section-title">Notices</h3>
                </div>
                <div v-if="expandedSections.notices" class="section-content">
                    <div v-for="(notice, index) in data.notices" :key="index" class="notice-item">
                        <div class="notice-header" @click="toggleNotice(index)">
                            <svg class="notice-icon" :class="{ 'expanded': expandedNotices[index] }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path v-if="expandedNotices[index]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span class="notice-title">{{ notice.title || notice.description || 'Notice' }}</span>
                        </div>
                        <div v-if="expandedNotices[index]" class="notice-details">
                            <div v-if="notice.description" class="notice-description">
                                {{ notice.description }}
                            </div>
                            <div v-if="notice.links && notice.links.length" class="notice-button-section">
                                <a :href="notice.links[0].value" target="_blank" class="button-link">
                                    {{ notice.title || notice.links[0].value }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    data: any
    source: string
}

const props = defineProps<Props>()

const expandedSections = ref({
    details: true,
    events: true,
    entities: true,
    nameservers: true,
    notices: true
})

const expandedEntities = ref<Record<number, boolean>>({})
const expandedNameservers = ref<Record<number, boolean>>({})
const expandedNotices = ref<Record<number, boolean>>({})

const toggleSection = (section: 'details' | 'events' | 'entities' | 'nameservers' | 'notices') => {
    expandedSections.value[section] = !expandedSections.value[section]
}

const toggleEntity = (index: number) => {
    expandedEntities.value[index] = !expandedEntities.value[index]
}

const toggleNameserver = (index: number) => {
    expandedNameservers.value[index] = !expandedNameservers.value[index]
}

const toggleNotice = (index: number) => {
    expandedNotices.value[index] = !expandedNotices.value[index]
}

const formatEventAction = (action: string) => {
    const actionMap: Record<string, string> = {
        'registration': 'Registration',
        'expiration': 'Expiration',
        'last changed': 'Last changed',
        'last update of rdap database': 'Last update of RDAP database'
    }
    return actionMap[action.toLowerCase()] || action
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        return date.toISOString()
    } catch {
        return dateString
    }
}

// 重置所有展开状态
const resetExpandedStates = () => {
    expandedSections.value = {
        details: true,
        events: true,
        entities: true,
        nameservers: true,
        notices: true
    }
    expandedEntities.value = {}
    expandedNameservers.value = {}
    expandedNotices.value = {}
}

// 监听 data 变化，重置状态
watch(() => props.data, (newData) => {
    if (newData) {
        resetExpandedStates()
        // 默认展开第一个 entity
        if (newData.entities && newData.entities.length > 0) {
            expandedEntities.value[0] = true
        }
    } else {
        resetExpandedStates()
    }
}, { immediate: true })

// 默认展开第一个 entity
onMounted(() => {
    if (props.data && props.data.entities && props.data.entities.length > 0) {
        expandedEntities.value[0] = true
    }
})
</script>

<style scoped>
.info-container {
    width: 100%;
    margin: 0 auto;
    padding: 1rem 0;
    position: relative;
    z-index: 1;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.info-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
}

.info-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
}

.info-badge.rdap {
    background: rgba(0, 220, 130, 0.2);
    color: #00DC82;
    border: 1px solid rgba(0, 220, 130, 0.3);
}

.info-badge.whois {
    background: rgba(96, 165, 250, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(96, 165, 250, 0.3);
}

.info-sections {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-section {
    background: rgba(10, 14, 32, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.3s ease;
}

.info-section:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(15, 21, 40, 0.95);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
    margin-bottom: 1rem;
}

.section-header.collapsed {
    margin-bottom: 0;
}

.section-header:hover {
    background: rgba(255, 255, 255, 0.05);
}

.section-title {
    color: #fff;
    font-size: 1.125rem;
    font-weight: 600;
    text-align: center;
    margin: 0;
    letter-spacing: 0.05em;
}

.section-content {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
}

.info-item {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: baseline;
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.875rem;
    min-width: fit-content;
}

.info-value {
    color: #e2e8f0;
    font-size: 0.875rem;
    flex: 1;
    word-break: break-word;
}

.status-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.status-tag,
.role-tag {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(0, 220, 130, 0.15);
    color: #00DC82;
    border: 1px solid rgba(0, 220, 130, 0.3);
    transition: all 0.2s ease;
    letter-spacing: 0.02em;
}

.status-tag:hover,
.role-tag:hover {
    background: rgba(0, 220, 130, 0.25);
    border-color: rgba(0, 220, 130, 0.4);
    transform: translateY(-1px);
}

.info-url {
    width: 100%;
    margin-top: 0.375rem;
}

.url-link {
    display: block;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #00DC82;
    font-size: 0.875rem;
    word-break: break-all;
    transition: all 0.2s ease;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.url-link:hover {
    background: rgba(0, 220, 130, 0.1);
    border-color: rgba(0, 220, 130, 0.3);
    color: #00f593;
}

.entity-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.625rem;
    margin-bottom: 0.625rem;
}

.entity-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.entity-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 0.625rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
}

.entity-header:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
}

.entity-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #00DC82;
    transition: transform 0.3s ease, color 0.2s ease;
    transform: rotate(0deg);
}

.entity-icon.expanded {
    transform: rotate(90deg);
}

.entity-header:hover .entity-icon {
    color: #00f593;
}

.entity-handle {
    color: #e2e8f0;
    font-size: 0.875rem;
    flex: 1;
}

.entity-roles {
    display: flex;
    gap: 0.5rem;
}

.entity-role-text {
    color: #94a3b8;
    font-size: 0.875rem;
}

.entity-details {
    margin-top: 0.5rem;
    padding-left: 2rem;
    padding-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    animation: slideDown 0.3s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.nameserver-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.625rem;
    margin-bottom: 0.625rem;
}

.nameserver-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.nameserver-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 0.625rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
}

.nameserver-header:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
}

.nameserver-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #00DC82;
    transition: transform 0.3s ease, color 0.2s ease;
    transform: rotate(0deg);
}

.nameserver-icon.expanded {
    transform: rotate(90deg);
}

.nameserver-header:hover .nameserver-icon {
    color: #00f593;
}

.nameserver-name {
    color: #e2e8f0;
    font-size: 0.875rem;
    flex: 1;
}

.nameserver-details {
    margin-top: 0.5rem;
    padding-left: 2rem;
    padding-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    animation: slideDown 0.3s ease;
}

.notice-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.625rem;
    margin-bottom: 0.625rem;
}

.notice-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.notice-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 0.625rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
}

.notice-header:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
}

.notice-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #00DC82;
    transition: transform 0.3s ease, color 0.2s ease;
    transform: rotate(0deg);
}

.notice-icon.expanded {
    transform: rotate(90deg);
}

.notice-header:hover .notice-icon {
    color: #00f593;
}

.notice-title {
    color: #e2e8f0;
    font-size: 0.875rem;
    flex: 1;
}

.notice-details {
    margin-top: 0.5rem;
    padding-left: 2rem;
    padding-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    animation: slideDown 0.3s ease;
}

.notice-description {
    color: #e2e8f0;
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 0.25rem;
}

.notice-button-section {
    margin-top: 0.25rem;
}

.button-link {
    text-align: center;
    display: block;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    font-weight: 500;
    color: #e2e8f0;
    text-decoration: none;
    transition: all 0.2s ease;
}

.button-link:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
}

.notice-link {
    color: #00DC82;
    font-size: 0.875rem;
    transition: color 0.2s;
}

.notice-link:hover {
    color: #00f593;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .info-container {
        padding: 0.75rem 0;
    }

    .info-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.625rem;
    }

    .info-section {
        padding: 0.875rem;
    }

    .info-sections {
        gap: 0.625rem;
    }

    .section-title {
        margin-bottom: 0.875rem;
    }

    .section-content {
        gap: 0.5rem;
    }

    .entity-details {
        padding-left: 1rem;
        gap: 0.375rem;
    }
}
</style>

