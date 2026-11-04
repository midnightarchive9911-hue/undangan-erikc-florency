/*
  EDIT DATA UNDANGAN DI BAGIAN INI.
  Tanggal menggunakan format: YYYY-MM-DDTHH:MM:SS+07:00
*/

const invitationData = {
  groom: "Erikc Tambunan",
  bride: "Florency Pardede",
  dateLabel: "Sabtu, 12 Desember 2026",
  dateISO: "2026-12-12T09:00:00+07:00",
  whatsappNumber: "081370711753",

  // Data Wedding Gift
  bankName: "Bank BRI",
  accountName: "FLORENCY MAGDALENA",
  accountNumber: "0113 0101 9541 539",
  qrisImage: "images/qris.png"
};


const openButton = document.getElementById("openInvitation");
const coverSection = document.getElementById("cover");
const invitationSection = document.getElementById("invitation");

// Atur agar halaman selalu mulai dari bagian paling atas
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

// Kunci halaman sebelum undangan dibuka
document.documentElement.classList.add("invitation-locked");

openButton.addEventListener("click", () => {
  if (coverSection.classList.contains("cover-opened")) return;

  coverSection.classList.add("cover-opened");
  document.documentElement.classList.remove("invitation-locked");

  setTimeout(() => {
    invitationSection.scrollIntoView({ behavior: "smooth" });
  }, 700);
});

// Nama tamu bisa diisi lewat tautan: index.html?to=Nama%20Tamu
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");
if (guest && guest.trim()) {
  document.getElementById("guestName").textContent = guest.trim();
}
document.getElementById("coverDate").textContent = invitationData.dateLabel;
document.title = `Undangan Pernikahan | ${invitationData.groom} & ${invitationData.bride}`;


const bankNameElement = document.getElementById("bankName");
const accountNameElement = document.getElementById("accountName");
const accountNumberElement = document.getElementById("accountNumber");
const qrisImageElement = document.querySelector(".qris-image");

if (bankNameElement) {
  bankNameElement.textContent = invitationData.bankName;
}

if (accountNameElement) {
  accountNameElement.textContent = invitationData.accountName;
}

if (accountNumberElement) {
  accountNumberElement.textContent = invitationData.accountNumber;
}

if (qrisImageElement) {
  qrisImageElement.src = invitationData.qrisImage;
}

const targetDate = new Date(invitationData.dateISO).getTime();
const countdownMessage = document.getElementById("countdownMessage");

function updateCountdown() {
  const now = Date.now();
  const distance = targetDate - now;

  if (Number.isNaN(targetDate)) {
    countdownMessage.textContent = "Periksa format tanggal di script.js.";
    return;
  }
  if (distance <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      document.getElementById(id).textContent = "00";
    });
    countdownMessage.textContent = "Hari bahagia telah tiba. Terima kasih atas doa Anda.";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVHPJvba8Q8c6dgRuz5uP3jRCFz_B1QZ7HsZnoG5ewzhrfI7N72OoD6pgXGqBm8YkWIQ/exec";

document.getElementById("rsvpForm").addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const name = document.getElementById("rsvpName").value.trim();
  const attendance = document.getElementById("attendance").value;
  const guestCount = Number(
    document.getElementById("guestCount").value.split(" ")[0]
  );
  const wish = document.getElementById("rsvpWish").value.trim();
  const invitation = document.getElementById("guestName").textContent.trim();
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');

  if (!name) {
    alert("Silakan isi nama Anda.");
    return;
  }

  const data = {
    id: "rsvp-" + Date.now() + "-" + Math.random().toString(36).slice(2),
    name,
    attendance: attendance === "Tidak dapat hadir" ? "Tidak hadir" : "Hadir",
    guestCount,
    wish,
    invitation
  };

  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    const checkSaved = () => new Promise((resolve, reject) => {
      const callbackName = "checkRsvp_" + Date.now();
      const checkScript = document.createElement("script");

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Waktu pemeriksaan habis."));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        checkScript.remove();
      }

      window[callbackName] = response => {
        cleanup();
        resolve(response && response.saved === true);
      };

      checkScript.onerror = () => {
        cleanup();
        reject(new Error("Pemeriksaan gagal."));
      };

      checkScript.src =
        `${GOOGLE_SCRIPT_URL}?callback=${callbackName}&checkId=${encodeURIComponent(data.id)}&t=${Date.now()}`;

      document.body.appendChild(checkScript);
    });

    // Tunggu sebentar agar data sempat masuk ke Google Sheets.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const saved = await checkSaved();

    if (saved) {
      alert("RSVP berhasil tersimpan. Terima kasih!");
      form.reset();
    } else {
      alert("RSVP belum terverifikasi. Silakan periksa koneksi dan coba lagi.");
    }
  } catch (error) {
    alert("Status RSVP belum dapat dipastikan. Periksa Google Sheets sebelum mengirim ulang.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kirim Konfirmasi";
  }
});

// ===== SALIN NOMOR REKENING =====
const copyAccountButtons = document.querySelectorAll(".gift-card button");

copyAccountButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const accountNumber = button
      .parentElement
      .querySelector(".account-number")
      .textContent.trim();

    try {
      await navigator.clipboard.writeText(accountNumber);
      button.textContent = "Nomor Berhasil Disalin!";
    } catch (error) {
      alert("Gagal menyalin nomor. Silakan salin secara manual: " + accountNumber);
    }
  });
});

 // Memuat ucapan dari Google Sheets
(function loadWishes() {
  const list = document.getElementById("wishesList");
  if (!list) return;

  const callbackName = "receiveInvitationWishes";

  window[callbackName] = function (response) {
    delete window[callbackName];

    if (!response || !response.success || !Array.isArray(response.wishes)) {
      list.textContent = "Ucapan belum dapat dimuat.";
      return;
    }

    list.replaceChildren();

    if (response.wishes.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Belum ada ucapan. Jadilah yang pertama!";
      list.appendChild(empty);
      return;
    }

    response.wishes.forEach(item => {
      const card = document.createElement("article");
      card.className = "wish-card";

      const name = document.createElement("h3");
      name.textContent = item.name || "Tamu";

      const wish = document.createElement("p");
      wish.textContent = item.wish || "";

      card.append(name, wish);
      list.appendChild(card);
    });
  };

  const script = document.createElement("script");
  script.src = `${GOOGLE_SCRIPT_URL}?callback=${callbackName}&t=${Date.now()}`;

  script.onerror = () => {
    delete window[callbackName];
    list.textContent = "Ucapan belum dapat dimuat. Coba muat ulang halaman.";
  };

  document.body.appendChild(script);
})();

// ===== MUSIK LATAR UNDANGAN =====

// ===== MUSIK LATAR UNDANGAN =====

const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const openInvitationButton = document.getElementById("openInvitation");

if (backgroundMusic && musicToggle && openInvitationButton) {

  openInvitationButton.addEventListener("click", () => {
    musicToggle.classList.add("music-visible");

    setTimeout(async () => {
      try {
        await backgroundMusic.play();
        musicToggle.textContent = "♫";
        musicToggle.setAttribute("aria-label", "Jeda musik");
        musicToggle.classList.add("music-playing");
      } catch (error) {
        console.log("Musik belum dapat diputar:", error);
      }
    }, 1500);
  });

  musicToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();
        musicToggle.textContent = "♫";
        musicToggle.setAttribute("aria-label", "Jeda musik");
        musicToggle.classList.add("music-playing");
      } catch (error) {
        console.log("Musik belum dapat diputar:", error);
      }
    } else {
      backgroundMusic.pause();
      musicToggle.textContent = "♪";
      musicToggle.setAttribute("aria-label", "Putar musik");
      musicToggle.classList.remove("music-playing");
    }
  });
}
// ===== ANIMASI TIRAI PEMBUKA =====

const curtain = document.getElementById("curtain");
const coverContent = document.querySelector(".cover-content");

if (curtain && coverContent) {
  setTimeout(() => {
    curtain.classList.add("opened");

    setTimeout(() => {
      coverContent.classList.add("cover-content-visible");
    }, 700);
  }, 200);
}

// ===== EFEK MUNCUL SAAT SCROLL =====

const revealElements = document.querySelectorAll(
  "main section:not(.cover)"
);

revealElements.forEach((element) => {
  element.classList.add("scroll-reveal");
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});
// ===== ANIMASI BERGANTIAN FOTO MEMPELAI =====

const coupleGrid = document.querySelector(".couple-grid");
const erikcCard = document.querySelector(".erikc-reveal");
const florencyCard = document.querySelector(".florency-reveal");

if (coupleGrid && erikcCard && florencyCard) {
  const coupleObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          erikcCard.classList.add("person-show");

          setTimeout(() => {
            florencyCard.classList.add("person-show");
          }, 1000);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  coupleObserver.observe(coupleGrid);
}
// ===== FITUR PERBESAR FOTO GALERI =====

const galleryImages = document.querySelectorAll(".gallery-grid img");
const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");

if (
  galleryImages.length &&
  galleryLightbox &&
  galleryLightboxImage &&
  galleryLightboxClose
) {
  galleryImages.forEach((img) => {
    img.style.cursor = "zoom-in";

    img.addEventListener("click", () => {
      galleryLightboxImage.src = img.src;
      galleryLightboxImage.alt = img.alt;
      galleryLightbox.classList.add("active");
      galleryLightbox.setAttribute("aria-hidden", "false");
    });
  });

  const closeGalleryLightbox = () => {
    galleryLightbox.classList.remove("active");
    galleryLightbox.setAttribute("aria-hidden", "true");
  };

  galleryLightboxClose.addEventListener("click", closeGalleryLightbox);

  galleryLightbox.addEventListener("click", (event) => {
    if (event.target === galleryLightbox) {
      closeGalleryLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGalleryLightbox();
    }
  });
}
// ===== FOTO SAMPUL BERGANTI OTOMATIS =====
const coverSlides = document.querySelectorAll(".cover-slide");

if (coverSlides.length > 1) {
  let currentCoverSlide = 0;

  setInterval(() => {
    coverSlides[currentCoverSlide].classList.remove("active");

    currentCoverSlide =
      (currentCoverSlide + 1) % coverSlides.length;

    coverSlides[currentCoverSlide].classList.add("active");
  }, 6000);
}
