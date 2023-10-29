const translations = {
    volunteer_title: 'טופס מקוון לתיעוד שיחות עם נכים',
    YES: 'כן',
    NO: 'לא',
    formType: 'סוג הטופס',
    formId: 'מספר טופס',
    volunteerNumber: 'מספר מתנדב',
    customerNumber: 'מספר לקוח',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    answeredPhone: 'האם התקבלה השיחה?',
    atHome: 'האם הלקוח בבית?',
    tempAddressAndDate: 'כתובת זמנית ותאריך',
    requireMedication: 'האם נדרשת תרופה או ציוד מתכלה?',
    requireSocialWorker: 'האם נדרש עו"ס?',
    requireEvacuation: 'האם מבקש פינוי?',
    comments: 'הערות',
    WRONG_NUMBER: 'מספר שגוי',
    MISSING_PHONE: 'לא ניתן להשיג',
    CreatedAt: 'נוצר בתאריך',
    Status: 'סטטוס',
    FormType: 'סוג הטופס',
    HandledAt: 'נטפל בתאריך',
    HandledBy: 'נטפל ע"י',
    Id: 'מספר טופס',
}

export function translate(key){
    return translations[key] || key;
}