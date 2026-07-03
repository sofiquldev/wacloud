/** Defaults when `site` shared prop is missing (should be rare). */
export const DEFAULT_PUBLIC_SITE = {
    appTitleBn: 'WaCloud',
    appTitleEn: 'WACLOUD APPLICATION PLATFORM',
    logoMode: 'builtin',
    logoImageUrl: null,
    logoSealLine1: 'WA',
    logoSealLine2: 'CLD',
    logoShowBanglaTitle: true,
    logoShowEnglishTitle: true,
    logoShowTitles: true,
    logoAlign: 'left',
    logoBuiltinPreset: 'official',
    noticeTickerEnabled: true,
    faviconUrl: null,
    footerIntroTitle: 'WaCloud',
    footerIntroBody:
        'WhatsApp API SaaS — send messages, manage accounts, and integrate with REST + webhooks.',
    footerAddress: 'Your company address',
    footerPhone: '+880 000 000 0000',
    footerEmail: 'hello@wacloud.app',
    footerCreditLine: 'Built with Laravel & Inertia',
    footerCopyrightTemplate: '© {year} {org}. All rights reserved.',
    footerOrganizationShort: 'WaCloud',
    currentYear: new Date().getFullYear(),
    customHeadCss: '',
    customBodyJs: '',
};

export function mergePublicSite(raw) {
    return { ...DEFAULT_PUBLIC_SITE, ...raw };
}

/** @param {string | undefined} align */
export function rowJustifyClass(align) {
    if (align === 'center') {
        return 'justify-center';
    }
    if (align === 'right') {
        return 'justify-end';
    }
    return 'justify-start';
}

export function formatCopyrightLine(template, org) {
    const y = new Date().getFullYear();
    return (template || '')
        .replace(/\{year\}/g, String(y))
        .replace(/\{org\}/g, org || '');
}
