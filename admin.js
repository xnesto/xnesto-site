/**
 * ملف إدارة المتجر - xnesto Admin Control
 * هذا الملف يقوم بتحديث المنتجات على GitHub مباشرة لجميع العملاء
 */

const GITHUB_CONFIG = {
    username: 'omarssp95',
    repo: 'xnesto-site',
    path: 'products.json',
    token: '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' // الرمز الذي قدمته
};

// دالة لتحديث ملف المنتجات على GitHub
async function updateGitHubProducts(newProducts) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
    
    try {
        // 1. جلب البيانات الحالية للملف (نحتاج لـ sha للتحديث)
        const getFileResponse = await fetch(url, {
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` }
        });
        
        if (!getFileResponse.ok) {
            throw new Error('تأكد من رفع ملف products.json أولاً إلى GitHub');
        }

        const fileData = await getFileResponse.json();
        const sha = fileData.sha;

        // 2. تجهيز البيانات الجديدة (بصيغة JSON)
        const updatedContent = {
            version: "v_" + new Date().getTime(), // رقم إصدار جديد تلقائياً
            games: newProducts.filter(p => p.category === 'games'),
            giftcards: newProducts.filter(p => p.category === 'giftcards')
        };

        // 3. إرسال التحديث لـ GitHub
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "تحديث المنتجات من لوحة التحكم",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedContent, null, 2)))), 
                sha: sha
            })
        });

        if (updateResponse.ok) {
            alert("✅ مبروك! تم تحديث المنتجات بنجاح لجميع العملاء.");
            // بدلاً من reload، نقوم بتحديث الـ version محلياً أيضاً
            localStorage.setItem("xnesto_version", updatedContent.version);
        } else {
            const err = await updateResponse.json();
            throw new Error(err.message);
        }
    } catch (error) {
        console.error('GitHub API Error:', error);
        alert("❌ حدث خطأ أثناء التحديث: " + error.message);
    }
}

// دالة جلب البيانات من GitHub عند فتح الموقع
async function fetchProductsFromGitHub() {
    const url = `https://omarssp95.github.io/xnesto-site/products.json?t=${new Date().getTime()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (e) {
        return null;
    }
}
