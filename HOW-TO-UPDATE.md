# 📘 How to Update Your Portfolio Website

Welcome to your next-generation academic & research portfolio (**`mdnafizurrahman8024.github.io`**).

This website was engineered with a **No-Code Future Content Architecture**: all dynamic content (research projects, publications, software applications, certifications, gallery photos, and contact channels) is powered by a single clean data file:
👉 **`data/portfolio-data.json`**

You **never need to write HTML, CSS, or JavaScript** to add or update your research records.

---

## 🚀 Method 1: Built-in Visual Content Manager (Recommended — Zero Code)

Your website features a password-protected **Visual Content Manager Drawer** built directly into the UI.

### Step-by-Step Instructions:
1. Open your portfolio in any web browser (`index.html` or `https://mdnafizurrahman8024.github.io`).
2. Scroll to the very bottom footer and click the subtle lock icon: **`🔒 Visual Content Manager`**.
3. Enter your administrator passcode:
   - **Default Passcode:** `nafiz2026`
4. Select the category you wish to add:
   - **Add Publication:** Title, type (Journal/Conference/Protocol), journal name, year, role, DOI link, and abstract.
   - **Add Project:** Project title, subtitle, role, timeline, category, status, methodology, and outcomes.
   - **Add Gallery Media:** Title, category (Fieldwork, Lab Microscopy, Data, Certificates), image path, date, and caption.
   - **Add Certificate:** Title, issuing body (WHO, UNITAR, WOAH), date, category, and description.
5. Click **"Add to Live Preview"** to see your additions update in real-time on your screen!
6. When finished, click **"Download Updated portfolio-data.json"** in the footer of the manager.
7. Replace the `data/portfolio-data.json` file in your repository with this newly downloaded file.
8. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add new research project and publication"
   git push origin main
   ```
   *Your live portfolio on GitHub Pages updates automatically within 60 seconds!*

---

## 🖼️ Adding Photos, Microscopy Images & Certificates

To add new photos (fieldwork, snake rescue, microscopic slides, certificates):

1. Save your image into the `assets/images/` folder (you can organize them into subfolders if desired, e.g., `assets/images/gallery/` or `assets/images/certificates/`).
   - *Supported formats: `.jpg`, `.png`, `.webp`, `.svg`*
2. Reference the image path in `data/portfolio-data.json` or through the Visual Content Manager:
   ```json
   {
     "id": "gal-10",
     "title": "Novel Capillaria Specimen Under Microscopic Oculometer",
     "category": "lab-clinical",
     "badge": "Parasitology",
     "date": "2026",
     "caption": "Morphometric measurement of Capillaria egg bipolar plugs.",
     "image": "assets/images/gallery/capillaria-egg.jpg"
   }
   ```

---

## 🛠️ Method 2: Direct Editing of `data/portfolio-data.json`

If you prefer editing the JSON file directly in VS Code, the structure is organized as follows:

| Section Key | Description |
| :--- | :--- |
| `profile` | Name, title, headline, salutation, bio, emails, phone, CV link, and verified profile URLs. |
| `researchProjects` | Complete list of all 8 major research projects with objectives, methodologies, and outcomes. |
| `publications` | Journal manuscripts, preprints, and OSF registered protocols with DOI links. |
| `conferencePapers` | Conference abstracts, presentation dates, and host universities. |
| `softwareProjects` | Vibe Coding software tools (PoultryMedix, Professors Vet Clinic, ZunSync, etc.). |
| `skillsCategorized` | Research, laboratory, clinical, programming, and bioinformatics skill levels. |
| `fieldworkWildlife` | SWAN Bangladesh wildlife rescue, free clinical vet campaigns, and vector trapping. |
| `certificationsTraining` | Verified WHO, UNITAR, WOAH, Gates Fdn, and Olympiad credentials. |
| `galleryItems` | Filterable photos for the full-screen Lightbox viewer. |

---

## ⚡ Keyboard Shortcuts for Visitors & Researchers

- **`Ctrl + K`** (or **`Cmd + K`** on Mac): Opens the instant **Command Palette / Quick Search** to find any research project, paper, or skill.
- **`Esc`**: Closes the full-screen Lightbox viewer or Search modal.
- **`←` / `→`**: Navigate previous/next image when viewing the full-screen Lightbox.

---

## 🔒 Changing Your Admin Passcode

To change your passcode:
1. Open `js/app.js`.
2. Locate the function `handleAdminAuth()`.
3. Change `'nafiz2026'` to your preferred new passcode:
   ```javascript
   if (password === 'your-new-secret-password') {
   ```
4. Save and commit.
