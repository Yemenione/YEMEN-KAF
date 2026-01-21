
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'SUPPORT' | 'FULFILLMENT';

export enum Permission {
    // Catalog
    MANAGE_PRODUCTS = 'manage_products',
    MANAGE_CATEGORIES = 'manage_categories',
    MANAGE_ATTRIBUTES = 'manage_attributes',
    MANAGE_BRANDS = 'manage_brands',

    // Orders & Inventory
    MANAGE_ORDERS = 'manage_orders',
    VIEW_ORDERS = 'view_orders',
    MANAGE_INVENTORY = 'manage_inventory',
    MANAGE_CARRIERS = 'manage_carriers',

    // Customers
    MANAGE_CUSTOMERS = 'manage_customers',
    VIEW_CUSTOMERS = 'view_customers',

    // CMS & Content
    MANAGE_CMS = 'manage_cms',
    MANAGE_BLOG = 'manage_blog',
    MANAGE_MEDIA = 'manage_media',

    // Marketing
    MANAGE_MARKETING = 'manage_marketing',

    // Support
    MANAGE_SUPPORT = 'manage_support', // Tickets & RMA

    // Settings & System
    MANAGE_SETTINGS = 'manage_settings',
    MANAGE_ADMINS = 'manage_admins',
    VIEW_ANALYTICS = 'view_analytics',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission),
    ADMIN: Object.values(Permission),

    EDITOR: [
        Permission.MANAGE_PRODUCTS,
        Permission.MANAGE_CATEGORIES,
        Permission.MANAGE_ATTRIBUTES,
        Permission.MANAGE_BRANDS,
        Permission.MANAGE_CMS,
        Permission.MANAGE_BLOG,
        Permission.MANAGE_MEDIA,
        Permission.VIEW_ORDERS,
        Permission.VIEW_CUSTOMERS,
        Permission.VIEW_ANALYTICS,
    ],

    SUPPORT: [
        Permission.VIEW_ORDERS,
        Permission.VIEW_CUSTOMERS,
        Permission.MANAGE_CUSTOMERS,
        Permission.MANAGE_SUPPORT,
        Permission.VIEW_ANALYTICS,
    ],

    FULFILLMENT: [
        Permission.MANAGE_ORDERS,
        Permission.VIEW_ORDERS,
        Permission.MANAGE_INVENTORY,
        Permission.MANAGE_CARRIERS,
        Permission.VIEW_CUSTOMERS,
    ]
};

/**
 * Checks if a role has a specific permission.
 */
export function hasPermission(role: string | AdminRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role as AdminRole] || [];
    return rolePermissions.includes(permission);
}

/**
 * Checks if a role can access a specific module (defined by a group of permissions).
 */
export function canAccessModule(role: string | AdminRole, module: 'CATALOG' | 'ORDERS' | 'CUSTOMERS' | 'CMS' | 'MARKETING' | 'SUPPORT' | 'SETTINGS' | 'ANALYTICS'): boolean {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    switch (module) {
        case 'CATALOG':
            return hasPermission(role, Permission.MANAGE_PRODUCTS);
        case 'ORDERS':
            return hasPermission(role, Permission.VIEW_ORDERS) || hasPermission(role, Permission.MANAGE_ORDERS);
        case 'CUSTOMERS':
            return hasPermission(role, Permission.VIEW_CUSTOMERS);
        case 'CMS':
            return hasPermission(role, Permission.MANAGE_CMS) || hasPermission(role, Permission.MANAGE_BLOG);
        case 'MARKETING':
            return hasPermission(role, Permission.MANAGE_MARKETING);
        case 'SUPPORT':
            return hasPermission(role, Permission.MANAGE_SUPPORT);
        case 'SETTINGS':
            return hasPermission(role, Permission.MANAGE_SETTINGS);
        case 'ANALYTICS':
            return hasPermission(role, Permission.VIEW_ANALYTICS);
        default:
            return false;
    }
}
