/** Defaults when `site` shared prop is missing (should be rare). */
export const DEFAULT_PUBLIC_SITE = {
    appTitleBn: 'পাবনা পৌরসভা ডিজিটাল ম্যানেজমেন্ট সিস্টেম',
    appTitleEn: 'PABNA POURASHAVA DIGITAL MANAGEMENT SYSTEM',
    logoMode: 'builtin',
    logoImageUrl: null,
    logoSealLine1: 'POURA',
    logoSealLine2: 'SEAL',
    logoShowBanglaTitle: true,
    logoShowEnglishTitle: true,
    logoShowTitles: true,
    logoAlign: 'left',
    logoBuiltinPreset: 'official',
    noticeTickerEnabled: true,
    faviconUrl: null,
    footerIntroTitle: 'Pabna Pourashava',
    footerIntroBody:
        'Committed to building a sustainable and citizen-friendly urban environment through digital innovation and accountable governance.',
    footerAddress: 'Municipal Office, Pourashava Road, Pabna 6600',
    footerPhone: '+880 731 66122',
    footerEmail: 'info@pabnapourashava.gov.bd',
    footerCreditLine: 'Developed by Municipal ICT Cell',
    footerCopyrightTemplate: '© {year} {org}. All rights reserved.',
    footerOrganizationShort: 'Pabna Pourashava',
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
