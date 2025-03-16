// services/regex.js

// 🔒 Regex contre les injections de scripts (XSS) et les balises HTML
// Cette regex détecte et bloque les balises HTML et les attributs JavaScript malveillants (ex: onClick, onMouseOver).
const scriptInjectionRegex = /<[^>]+(on\w+\s*=\s*['"][^'"]*['"]|javascript:|data:|vbscript:)[^>]*>|<[^>]+>/gi;

// 🔤 Regex pour un nom/prénom valide
// Autorise les lettres, accents, espaces et tirets uniquement. Exclut les chiffres et caractères spéciaux interdits.
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/;

// 📧 Regex pour une adresse email valide
// Vérifie un format correct : nom@domaine.ext avec un TLD de 2 à 10 lettres.
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

// 🔢 Regex pour un numéro SIRET valide (14 chiffres uniquement)
const siretRegex = /^\d{14}$/;

const postalCodeRegex = /^\d{5}$/;
const cityRegex = /^[A-Za-zÀ-ÿÉéÈèÊêËëÎîÏïÔôŒœÙùÛûÜüÿ\- ]+$/;

// 📌 Exportation des regex pour les utiliser dans tout le projet
module.exports = { 
    scriptInjectionRegex, 
    nameRegex, 
    emailRegex, 
    siretRegex,
    postalCodeRegex,
    cityRegex
};

