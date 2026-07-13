<#-- Custom Login Page for Gestion du Parc Automobile (MESRSI) -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Connexion - Gestion du Parc Automobile</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${url.resourcesPath}/css/styles.css" type="text/css" />
</head>
<body>
    <div class="login-wrapper">
        <div class="login-background">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
        </div>
        
        <div class="login-card-container">
            <!-- Ministry / Brand Header -->
            <div class="login-header">
                <div class="logo-area">
                    <!-- SVG Royal Moroccan Crest inspired graphic -->
                    <svg viewBox="0 0 100 100" class="ministry-logo" width="70" height="70">
                        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#D4AF37" stroke-width="3" />
                        <polygon points="50,18 82,34 82,66 50,82 18,66 18,34" fill="none" stroke="#1A365D" stroke-width="2" />
                        <path d="M50,25 L65,65 L30,40 L70,40 L35,65 Z" fill="#D4AF37" /> <!-- Green/Gold Star -->
                    </svg>
                </div>
                <div class="ministry-title">ROYAUME DU MAROC</div>
                <div class="ministry-subtitle">Ministère de l'Enseignement Supérieur, de la Recherche Scientifique et de l'Innovation</div>
                <h1 class="app-title">Gestion du Parc Automobile</h1>
                <p class="app-subtitle">Connectez-vous pour accéder à l'application</p>
            </div>

            <!-- Keycloak Error/Info Messages -->
            <#if message?? && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="alert alert-${message.type}">
                    <div class="alert-icon">
                        <#if message.type = 'success'>
                            <svg viewBox="0 0 24 24" class="svg-icon"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/></svg>
                        <#elseif message.type = 'error'>
                            <svg viewBox="0 0 24 24" class="svg-icon"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m1 15h-2v-2h2v2m0-4h-2V7h2v6Z"/></svg>
                        <#else>
                            <svg viewBox="0 0 24 24" class="svg-icon"><path fill="currentColor" d="M11 18h2v-2h-2v2m1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2V7z"/></svg>
                        </#if>
                    </div>
                    <span class="alert-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <!-- Login Form -->
            <#if realm.password>
                <form id="kc-form-login" class="login-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    
                    <!-- Username / Email Field -->
                    <div class="form-group">
                        <label for="username" class="form-label">Identifiant ou Adresse Email</label>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg viewBox="0 0 24 24" class="svg-icon"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>
                            </span>
                            <input id="username" class="form-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" placeholder="Ex: amrani.said" required />
                        </div>
                    </div>

                    <!-- Password Field -->
                    <div class="form-group">
                        <div class="form-label-row">
                            <label for="password" class="form-label">Mot de passe</label>
                            <#if realm.resetPasswordAllowed>
                                <a id="reset-password-link" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">Mot de passe oublié ?</a>
                            </#if>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg viewBox="0 0 24 24" class="svg-icon"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2Z"/></svg>
                            </span>
                            <input id="password" class="form-input" name="password" type="password" autocomplete="off" placeholder="••••••••" required />
                        </div>
                    </div>

                    <!-- Remember Me -->
                    <#if realm.rememberMe && !usernameEditDisabled??>
                        <div class="form-options">
                            <label class="checkbox-container">
                                <input id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                                <span class="checkmark"></span>
                                Se souvenir de moi
                            </label>
                        </div>
                    </#if>

                    <!-- Actions -->
                    <div class="form-actions">
                        <button id="login-btn" class="btn btn-primary btn-block" name="login" type="submit">Se connecter</button>
                    </div>

                </form>
            </#if>
        </div>
    </div>
</body>
</html>
