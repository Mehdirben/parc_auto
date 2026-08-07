package com.parcautomobile.shared.security;

import java.util.Set;

public final class RoleApplication {
    public static final String ADMIN = "admin";
    public static final String GESTIONNAIRE = "gestionnaire";
    public static final String CONSULTATION = "consultation";
    public static final Set<String> TOUS = Set.of(ADMIN, GESTIONNAIRE, CONSULTATION);

    private RoleApplication() {}
}
