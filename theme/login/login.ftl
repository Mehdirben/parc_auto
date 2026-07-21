<#-- MESRSI Parc Automobile - Keycloak login page -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Connexion - Gestion du Parc Automobile</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/styles.css" type="text/css" />
</head>
<body>
    <main class="login-page">
        <div class="background-grid" aria-hidden="true"></div>
        <div class="background-orb orb-one" aria-hidden="true"></div>
        <div class="background-orb orb-two" aria-hidden="true"></div>

        <section class="login-shell">
            <aside class="brand-panel">
                <div class="brand-topline"></div>
                <div class="brand-identity">
                    <div class="brand-emblem">
                        <svg viewBox="0 0 100 100" width="62" height="62" aria-hidden="true">
                            <polygon points="50,8 91,29 91,71 50,92 9,71 9,29" fill="none" stroke="currentColor" stroke-width="3" />
                            <polygon points="50,17 82,34 82,66 50,83 18,66 18,34" fill="none" stroke="#ffffff" stroke-opacity=".72" stroke-width="2" />
                            <path d="M50 24 57 42l19 1-15 12 5 19-16-11-16 11 5-19-15-12 19-1 7-18Z" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <span class="brand-name">PARC MESRSI</span>
                        <span class="brand-caption">Gestion automobile</span>
                    </div>
                </div>

                <div class="brand-message">
                    <span class="brand-kicker">ROYAUME DU MAROC</span>
                    <h1>Le parc automobile,<br>piloté simplement.</h1>
                    <p>Un espace centralisé et sécurisé pour gérer les référentiels, les véhicules, les affectations et les documents du parc.</p>
                </div>

                <div class="brand-features">
                    <div class="feature-item">
                        <span class="feature-icon">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 19h16v2H4v-2Zm1-7h3v5H5v-5Zm5-5h3v10h-3V7Zm5 3h3v7h-3v-7Z"/></svg>
                        </span>
                        <span><strong>Données centralisées</strong><small>Une vision fiable et traçable du parc</small></span>
                    </div>
                </div>

                <div class="brand-ministry">Ministère de l'Enseignement Supérieur,<br>de la Recherche Scientifique et de l'Innovation</div>
            </aside>

            <section class="form-panel">
                <div class="mobile-brand">
                    <span class="mobile-emblem">
                        <svg viewBox="0 0 48 48" width="34" height="34"><path d="M24 4 42 14v20L24 44 6 34V14L24 4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m24 12 3.3 7.7 8.3.7-6.3 5.5 1.9 8.1-7.2-4.2-7.2 4.2 1.9-8.1-6.3-5.5 8.3-.7L24 12Z" fill="currentColor"/></svg>
                    </span>
                    <span><strong>PARC MESRSI</strong><small>Gestion automobile</small></span>
                </div>

                <div class="form-content">
                    <header class="login-header">
                        <span class="page-kicker">ESPACE SÉCURISÉ</span>
                        <h2>Bienvenue</h2>
                        <p>Connectez-vous pour accéder à la gestion du parc automobile.</p>
                    </header>

                    <#if message?? && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="alert alert-${message.type}" role="alert">
                            <span class="alert-icon">
                                <#if message.type = 'success'>
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-2 15-4-4 1.41-1.41L10 14.17l6.59-6.58L18 11l-8 8Z"/></svg>
                                <#elseif message.type = 'error'>
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/></svg>
                                <#else>
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2Zm0-8h2V7h-2Zm1-7a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/></svg>
                                </#if>
                            </span>
                            <span class="alert-text">${kcSanitize(message.summary)?no_esc}</span>
                        </div>
                    </#if>

                    <#if realm.password>
                        <form id="kc-form-login" class="login-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                            <div class="form-group">
                                <label for="username" class="form-label">Identifiant ou adresse e-mail</label>
                                <div class="input-wrapper">
                                    <span class="input-icon">
                                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4Zm0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>
                                    </span>
                                    <input id="username" class="form-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username" placeholder="Votre identifiant" required />
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="form-label-row">
                                    <label for="password" class="form-label">Mot de passe</label>
                                    <#if realm.resetPasswordAllowed>
                                        <a id="reset-password-link" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">Mot de passe oublié ?</a>
                                    </#if>
                                </div>
                                <div class="input-wrapper">
                                    <span class="input-icon">
                                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 9a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm3-9H9V6a3 3 0 0 1 6 0Z"/></svg>
                                    </span>
                                    <input id="password" class="form-input" name="password" type="password" autocomplete="current-password" placeholder="Votre mot de passe" required />
                                </div>
                            </div>

                            <#if realm.rememberMe && !usernameEditDisabled??>
                                <div class="form-options">
                                    <label class="checkbox-container">
                                        <input id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                                        <span class="checkmark"></span>
                                        <span>Se souvenir de moi</span>
                                    </label>
                                </div>
                            </#if>

                            <button id="login-btn" class="login-button" name="login" type="submit">
                                <span>Se connecter</span>
                                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="m9.3 17.3 5.3-5.3-5.3-5.3 1.4-1.4 6.7 6.7-6.7 6.7-1.4-1.4Z"/></svg>
                            </button>
                        </form>
                    </#if>

                    <footer class="form-footer">
                        <span class="security-mark">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10h12V10a2 2 0 0 0-2-2Zm-3 0H9V6a3 3 0 0 1 6 0Z"/></svg>
                        </span>
                        <span>Accès réservé aux utilisateurs habilités du MESRSI</span>
                    </footer>
                </div>
            </section>
        </section>
    </main>
</body>
</html>
