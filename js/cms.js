/*
    CMS Integration - SAFE MODE
    - Hides HTML tags from user
    - Handles Newlines cleanly
    - Reconstructs structure automatically
*/

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    try { firebase.initializeApp(firebaseConfig); } catch (e) { console.error(e); }
}

let db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
let storage = typeof firebase !== 'undefined' ? firebase.storage() : null;

const collectionName = "site_content";
const docId = "main_content";

// --- HELPER: TEXT CONVERSION ---
// Robust handling for mixed content (both \n and <br>)
function brToNewline(html) {
    if (!html) return "";
    return html.replace(/<br\s*\/?>/gi, '\n');
}

function newlineToBr(text) {
    if (!text) return "";
    return text.replace(/\n/g, '<br>');
}

/* 
    SCHEMA STRATEGY:
    - Textareas use \n for defaults (Code Cleanliness)
    - View Mode converts \n to <br>
*/
const cmsSchema = [
    {
        title: "❤️ Top Section",
        fields: [
            { id: "hero-name-1", label: "Partner 1 Name", type: "text", default: "Aashu" },
            { id: "hero-name-2", label: "Partner 2 Name", type: "text", default: "Jasveer" },
            { id: "hero-sub-line-1", label: "Subtitle Line 1 (Bold)", type: "text", default: "We’re building a life together." },
            { id: "hero-sub-line-2", label: "Subtitle Line 2", type: "text", default: "We are together from :" },
        ]
    },
    {
        title: "📸 Vertical Scroll Photos (Hero)",
        fields: [
            { id: "hero-scroll-1", label: "Photo 1", type: "image", default: "https://placehold.co/400x500?text=Memory+1" },
            { id: "hero-scroll-2", label: "Photo 2", type: "image", default: "https://placehold.co/400x500?text=Memory+2" },
            { id: "hero-scroll-3", label: "Photo 3", type: "image", default: "https://placehold.co/400x500?text=Memory+3" },
            { id: "hero-scroll-4", label: "Photo 4", type: "image", default: "https://placehold.co/400x500?text=Memory+4" },
            { id: "hero-scroll-5", label: "Photo 5", type: "image", default: "https://placehold.co/400x500?text=Memory+5" },
        ]
    },
    {
        title: "✨ Memories Marquee",
        fields: [
            { id: "memory-1-img", label: "Memory 1 Photo", type: "image", default: "https://placehold.co/400x500?text=1st+Birthday" },
            { id: "memory-1-title", label: "Memory 1 Title", type: "text", default: "Your 1st birthday" },
            { id: "memory-1-desc", label: "Memory 1 Desc", type: "textarea", default: "The day that I knew i would celebrate the rest of my life with you" },

            { id: "memory-2-img", label: "Memory 2 Photo", type: "image", default: "https://placehold.co/400x500?text=Movie+Date" },
            { id: "memory-2-title", label: "Memory 2 Title", type: "text", default: "Our Movie date" },
            { id: "memory-2-desc", label: "Memory 2 Desc", type: "textarea", default: "Just you, me, and apni movie" },

            { id: "memory-3-img", label: "Memory 3 Photo", type: "image", default: "https://placehold.co/400x500?text=Trip" },
            { id: "memory-3-title", label: "Memory 3 Title", type: "text", default: "Trip" },
            { id: "memory-3-desc", label: "Memory 3 Desc", type: "textarea", default: "Just you, me, and apni trip" },

            { id: "memory-4-img", label: "Memory 4 Photo", type: "image", default: "https://placehold.co/400x500?text=Bike+ride" },
            { id: "memory-4-title", label: "Memory 4 Title", type: "text", default: "Bike ride" },
            { id: "memory-4-desc", label: "Memory 4 Desc", type: "textarea", default: "Every trip is a story I want to write with you." },

            { id: "memory-5-img", label: "Memory 5 Photo", type: "image", default: "https://placehold.co/400x500?text=days" },
            { id: "memory-5-title", label: "Memory 5 Title", type: "text", default: "tution days" },
            { id: "memory-5-desc", label: "Memory 5 Desc", type: "textarea", default: "Chaos, food, pranks and late-night chats" },
        ]
    },
    {
        title: "💞 Photo Collage",
        fields: [
            { id: "polaroid-1-img", label: "Collage 1 Photo", type: "image", default: "https://placehold.co/400x500?text=Pizza+Night" },
            { id: "polaroid-1-caption", label: "Collage 1 Caption", type: "text", default: "Best Mistake Ever" },

            { id: "polaroid-2-img", label: "Collage 2 Photo", type: "image", default: "https://placehold.co/400x500?text=Sunrise+Smile" },
            { id: "polaroid-2-caption", label: "Collage 2 Caption", type: "text", default: "Cuddles and kisses" },

            { id: "polaroid-3-img", label: "Collage 3 Photo", type: "image", default: "https://placehold.co/400x500?text=Late+Night+Drive" },
            { id: "polaroid-3-caption", label: "Collage 3 Caption", type: "text", default: "cuties" },

            { id: "polaroid-4-img", label: "Collage 4 Photo", type: "image", default: "https://placehold.co/400x500?text=Fancy+Dinner" },
            { id: "polaroid-4-caption", label: "Collage 4 Caption", type: "text", default: "ussss❤️" },

            { id: "polaroid-5-img", label: "Collage 5 Photo", type: "image", default: "https://placehold.co/400x500?text=Crazy+Love" },
            { id: "polaroid-5-caption", label: "Collage 5 Caption", type: "text", default: "Goofballs" },
        ]
    },
    {
        title: "💌 Love Letter",
        fields: [
            { id: "letter-salutation", label: "Salutation", type: "text", default: "My Dearest," },
            // Using \n here for clean code. View logic will handle conversion.
            { id: "letter-body", label: "Message Body", type: "textarea", default: "Every day with you feels like a page out of my favorite book. You are my joy, my laughter, and my greatest adventure.\n\nI love you more than words can say.\n\nForever yours,\n❤️" },
        ]
    },
    {
        title: "📜 Promise Section",
        fields: [
            { id: "promise-title", label: "Section Title", type: "text", default: "Our Promise to Each Other" },
            { id: "promise-1", label: "Promise 1", type: "text", default: "I promise to always be your safe space." },
            { id: "promise-2", label: "Promise 2", type: "text", default: "To laugh with you until our stomachs hurt." },
            { id: "promise-3", label: "Promise 3", type: "text", default: "To hold your hand through every storm." },
            { id: "promise-4", label: "Promise 4", type: "text", default: "And to love you, fiercely and softly, for all my days." },
        ]
    }
];

let pendingUploads = new Map();
let currentData = {};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-container')) {
        initAdminPage();
    } else {
        initViewPage();
    }
});

// --- VIEW LOGIC (Reconstructs HTML) ---
function initViewPage() {
    loadContent((data) => {
        if (!data) return;

        applySimpleMappings(data);
        applyComplexMappings(data); // Reconstruct structural HTML
    });
}

function applySimpleMappings(data) {
    cmsSchema.forEach(section => {
        section.fields.forEach(field => {
            const val = data[field.id] || field.default;

            let el = document.querySelector(`[data-cms-id="${field.id}"]`);
            if (el) {
                if (field.type === 'image') {
                    el.src = val;
                } else if (field.type === 'textarea') {
                    // Convert stored newlines to <br> for display
                    el.innerHTML = newlineToBr(val);
                } else {
                    el.innerHTML = val;
                }
            }
        });
    });
}

function applyComplexMappings(data) {
    const name1 = data['hero-name-1'] || "Aashu";
    const name2 = data['hero-name-2'] || "Jasveer";
    const heroTitleEl = document.querySelector('[data-cms-id="hero-title"]');
    if (heroTitleEl) {
        heroTitleEl.innerHTML = `${name1} & ${name2}<br><span>💖</span>`;
    }

    const line1 = data['hero-sub-line-1'] || "We’re building a life together.";
    const line2 = data['hero-sub-line-2'] || "We are together from :";
    const heroSubEl = document.querySelector('[data-cms-id="hero-subtitle"]');
    if (heroSubEl) {
        heroSubEl.innerHTML = `<b>${line1}</b><br>${line2}`;
    }
}

// --- ADMIN LOGIC ---
function initAdminPage() {
    // Simple Password Check
    const password = prompt("Unknown user detected. Enter Admin Password:");
    if (password !== "openingbatsman") {
        alert("Access Denied!");
        window.location.href = "index.html";
        return;
    }

    generateAdminUI();
    loadContent((data) => {
        currentData = data || {};
        populateAdminForm(currentData);
        document.getElementById('loading').style.display = 'none';

        const first = document.querySelector('.section-content');
        if (first) first.classList.add('open');
    });

    document.getElementById('save-all-btn').addEventListener('click', saveAdminChanges);
}

function generateAdminUI() {
    const container = document.getElementById('admin-container');
    cmsSchema.forEach(section => {
        const group = document.createElement('div');
        group.className = 'section-group';

        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerText = section.title;
        group.appendChild(header);

        const content = document.createElement('div');
        content.className = 'section-content';

        section.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'form-group';

            const label = document.createElement('label');
            label.innerText = field.label;
            row.appendChild(label);

            if (field.type === 'image') {
                const img = document.createElement('img');
                img.className = 'image-preview';
                img.id = `preview-${field.id}`;
                img.src = field.default;

                const fileIn = document.createElement('input');
                fileIn.type = 'file';
                fileIn.id = `file-${field.id}`;
                fileIn.accept = 'image/*';
                fileIn.addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        const f = e.target.files[0];
                        pendingUploads.set(field.id, f);
                        const reader = new FileReader();
                        reader.onload = (ev) => img.src = ev.target.result;
                        reader.readAsDataURL(f);
                    }
                });

                const btn = document.createElement('label');
                btn.className = 'file-upload-btn';
                btn.innerText = "📂 Upload New";
                btn.setAttribute('for', `file-${field.id}`);

                row.appendChild(img);
                row.appendChild(fileIn);
                row.appendChild(btn);
            } else if (field.type === 'textarea') {
                const area = document.createElement('textarea');
                area.id = `input-${field.id}`;
                // Input always sees \n. 
                // brToNewline handles mixed content if DB has <br>
                area.value = brToNewline(field.default);
                row.appendChild(area);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `input-${field.id}`;
                input.value = field.default;
                row.appendChild(input);
            }
            content.appendChild(row);
        });
        group.appendChild(content);
        container.insertBefore(group, document.getElementById('loading'));
    });
}

function populateAdminForm(data) {
    cmsSchema.forEach(section => {
        section.fields.forEach(field => {
            const val = data[field.id];
            if (!val) return;

            if (field.type === 'image') {
                document.getElementById(`preview-${field.id}`).src = val;
            } else if (field.type === 'textarea') {
                // Ensure db content is converted to \n for editing
                document.getElementById(`input-${field.id}`).value = brToNewline(val);
            } else {
                document.getElementById(`input-${field.id}`).value = val;
            }
        });
    });
}

async function saveAdminChanges() {
    const btn = document.getElementById('save-all-btn');
    const toast = document.getElementById('status-toast');
    btn.disabled = true;
    toast.style.display = 'block';
    toast.innerText = "Uploading & Saving...";

    try {
        const updates = {};
        if (pendingUploads.size > 0) {
            const promises = Array.from(pendingUploads.entries()).map(async ([id, file]) => {
                const ref = storage.ref().child(`uploads/${Date.now()}_${file.name}`);
                await ref.put(file);
                const url = await ref.getDownloadURL();
                updates[id] = url;
            });
            await Promise.all(promises);
            pendingUploads.clear();
        }

        cmsSchema.forEach(section => {
            section.fields.forEach(field => {
                if (field.type !== 'image') {
                    const el = document.getElementById(`input-${field.id}`);
                    if (el) {
                        // STORE AS RAW NEWLINES (Database agnostic)
                        // View logic handles the conversion to <br>
                        updates[field.id] = el.value;
                    }
                }
            });
        });

        await db.collection(collectionName).doc(docId).set(updates, { merge: true });

        toast.innerText = "✅ Saved!";
        setTimeout(() => toast.style.display = 'none', 2000);

    } catch (e) {
        console.error(e);
        toast.innerText = "❌ Error: " + e.message;
    } finally {
        btn.disabled = false;
    }
}

function loadContent(cb) {
    db.collection(collectionName).doc(docId).get().then(doc => {
        cb(doc.exists ? doc.data() : {});
    }).catch(e => cb({}));
}
