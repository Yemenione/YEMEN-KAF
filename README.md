# 🇾🇪 Yemen Kaf - Plateforme E-Commerce de Luxe

**Version :** 1.0.0 (Production Ready)  
**Développeur Principal :** Shihab  
**Dernière Mise à Jour :** 26 Janvier 2026

---

## � Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Architecture Technique](#-architecture-technique)
3. [Fonctionnalités Clés](#-fonctionnalités-clés)
4. [Base de Données (Schéma)](#-base-de-données-schéma)
5. [Guide d'Installation](#-guide-dinstallation)
6. [Structure du Projet](#-structure-du-projet)
7. [Guide de Déploiement](#-guide-de-déploiement)
8. [Crédits et Maintenance](#-crédits-et-maintenance)

---

## 📋 Vue d'Ensemble

**Yemen Kaf** est une solution e-commerce moderne conçue pour commercialiser des produits yéménites d'exception (Miel de Sidr, Café, Encens) à une clientèle internationale.

Le projet se distingue par :

- Un **Design Premium** "Cinématique" (noir, or, blanc, typographies Serif).
- Une approche **Mobile-First** absolue (navigation inférieure, tiroirs tactiles).
- Une **Gestion Multi-Régions** (Support Europe + Monde : USA, Golfe, Asie).
- Un **Back-Office (Admin)** complet pour une gestion autonome sans code.

---

## 🛠 Architecture Technique

Le projet repose sur la stack technique la plus moderne de 2026 :

| Composant | Technologie | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend/Backend** | **Next.js** | **16.1.2** | App Router, Server Actions, Turbopack |
| **Langage** | **TypeScript** | **5.x** | Typage strict pour la robustesse |
| **Interface UI** | **React** | **19.2.3** | Composants fonctionnels, Hooks |
| **Base de Données** | **MySQL** | **8.0** | Relationnel, via PlanetScale ou VPS |
| **ORM** | **Prisma** | **5.22.0** | Gestion de schéma et requêtes typesafe |
| **Styling** | **TailwindCSS** | **3.4** | Design utilitaire responsive |
| **Emails** | **Resend** | **6.7** | Envoi transactionnel (factures, notifs) |
| **Animations** | **Framer Motion** | **12.2** | Transitions fluides et micro-interactions |

---

## 🚀 Fonctionnalités Clés

### 1. Boutique (Client)

- **Catalogue Dynamique :** Filtrage par catégories (Miel, Café, etc.), recherche instantanée.
- **Panier Intelligent :** Tiroir latéral (Drawer), persistance locale, calculs en temps réel.
- **Checkout International :**
  - Formulaire d'adresse intelligent.
  - Sélection de pays étendue (inclus USA, KSA, UAE...).
  - Calcul automatique des frais de port (Table Rates).
- **Blog Intégré :** Articles SEO pour le référencement naturel.

### 2. Espace Administration (`/admin-portal`)

Une interface sécurisée pour piloter l'activité :

- **Tableau de Bord :** Stats ventes, nouvelles commandes.
- **CMS (Gestion de Contenu) :**
  - **Blog :** Rédiger/Éditer les articles (Titre, Contenu HTML, Image, Slug).
  - **Pages :** Gérer "À Propos", "Mentions Légales".
- **Catalogue :** Création de produits, gestion des stocks, variantes (Poids/Taille).
- **Commandes :** Changement de statut (En cours -> Expédié), impression bordereaux.
- **Livraison :** Configuration des "Zones" (ex: Europe) et transporteurs (DHL, Colissimo).

---

## 🗄 Base de Données (Schéma)

Voici les entités principales gérées par le système (extrait du `schema.prisma`) :

- **Product :** Stocke les infos produits, prix, stock. Lié à `ProductVariant` pour les déclinaisons.
- **Order :** Historique des commandes clients, adresses, et `OrderItems`.
- **User/Customer :** Comptes clients, historique d'achats, points fidélité.
- **BlogPost :** `id`, `title`, `slug` (URL), `content` (HTML), `status` (DRAFT/PUBLISHED).
- **ShippingZone :** Définit les pays livrables et les tarifs associés.

---

## 💻 Guide d'Installation

Idéal pour un nouvel environnement de développement.

### 1. Cloner le Projet

```bash
git clone https://github.com/Yemenione/YEMEN-KAF.git
cd yemeni-market
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration d'Environnement

Créer un fichier `.env` à la racine :

```env
# Base de données (Lien de connexion MySQL)
DATABASE_URL="mysql://user:password@host:3306/db_name"

# Sécurité (Générer avec `openssl rand -base64 32`)
NEXTAUTH_SECRET="votre_secret_super_securise"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Services Tiers (Optionnel au début)
RESEND_API_KEY="re_123..."
STRIPE_SECRET_KEY="sk_test..."
```

### 4. Initialiser la Base de Données

```bash
# Applique le schéma Prisma à votre BDD MySQL
npx prisma db push
```

### 5. Lancer en Local

```bash
npm run dev
# Accès : http://localhost:3000
```

---

## � Structure du Projet

```
.
├── app/
│   ├── (admin)/admin-portal/   # Routes de l'Administration
│   ├── (shop)/                 # Routes de la Boutique (Publiques)
│   ├── actions/                # Server Actions (Backend Logic)
│   │   ├── blog.ts             # Logique Blog
│   │   ├── zones.ts            # Logique Livraison
│   │   └── ...
│   ├── api/                    # Routes API REST (Webhooks, Uploads)
│   └── globals.css             # Styles globaux
├── components/                 # Composants React Réutilisables
│   ├── cart/                   # Panier (Drawer)
│   ├── layout/                 # Navbar, Footer
│   └── shop/                   # Sections Page d'Accueil
├── prisma/
│   └── schema.prisma           # Définition de la BDD
├── public/                     # Images statiques, uploads
└── README.md                   # Ce fichier
```

---

## � Guide de Déploiement

Le site est optimisé pour **Vercel**, mais compatible avec tout hébergeur Node.js.

### Mise à Jour Rapide (Workflow Quotidien)

Pour pousser vos modifications en production :

1. **Vérifier vos changements :**

    ```bash
    git status
    ```

2. **Ajouter les fichiers modifiés :**

    ```bash
    git add .
    ```

3. **Sauvegarder (Commit) :**

    ```bash
    git commit -m "description des changements"
    ```

4. **Envoyer en ligne (Push) :**

    ```bash
    git push
    ```

Vercel détectera le push et lancera automatiquement le build et le déploiement.

---

## 👨‍💻 Crédits et Maintenance

Ce projet a été architecturé et développé avec soin par **Shihab**.  
Il représente une solution e-commerce complète, évolutive et maintenable.

Pour toute question technique, se référer à la documentation Next.js et Prisma ou contacter le développeur principal.

---
*© 2026 Yemen Kaf. Tous droits réservés.*
