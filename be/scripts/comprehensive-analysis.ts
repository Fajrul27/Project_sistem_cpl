import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AnalysisResult {
    permissionConsistency: any;
    routeProtection: any;
    dataFiltering: any;
    securityIssues: string[];
    recommendations: string[];
}

async function comprehensiveAnalysis(): Promise<AnalysisResult> {
    const result: AnalysisResult = {
        permissionConsistency: {},
        routeProtection: {},
        dataFiltering: {},
        securityIssues: [],
        recommendations: []
    };

    console.log('🔍 COMPREHENSIVE SYSTEM ANALYSIS');
    console.log('='.repeat(80));

    // 1. Permission Consistency Check
    console.log('\n📋 1. PERMISSION CONSISTENCY CHECK');
    console.log('-'.repeat(80));

    const roles = await prisma.role.findMany();
    const resources = ['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
        'nilai_teknik', 'kuesioner', 'dosen_pengampu', 'kaprodi_data', 'mahasiswa',
        'users', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
        'settings', 'evaluasi_mk', 'role_permissions', 'default_role_permissions', 'fakultas',
        'roles', 'audit_log', 'tahun_ajaran'];
    const actions = ['view', 'create', 'edit', 'delete', 'view_all', 'verify'];

    for (const role of roles) {
        const defaultPerms = await prisma.defaultRolePermission.count({
            where: { roleId: role.id }
        });
        const actualPerms = await prisma.rolePermission.count({
            where: { roleId: role.id }
        });

        const expected = resources.length * actions.length;

        console.log(`Role: ${role.name}`);
        console.log(`  - Default Permissions: ${defaultPerms}/${expected} (${(defaultPerms / expected * 100).toFixed(1)}%)`);
        console.log(`  - Actual Permissions: ${actualPerms}/${expected} (${(actualPerms / expected * 100).toFixed(1)}%)`);

        if (defaultPerms < expected) {
            result.securityIssues.push(`${role.name}: Incomplete default permissions (${defaultPerms}/${expected})`);
        }
        if (actualPerms < expected) {
            result.recommendations.push(`${role.name}: Consider initializing all permissions (current: ${actualPerms}/${expected})`);
        }
    }

    // 2. Check for orphaned permissions
    console.log('\n🗑️  2. ORPHANED PERMISSIONS CHECK');
    console.log('-'.repeat(80));

    const allDefaultPerms = await prisma.defaultRolePermission.findMany({
        select: { resource: true },
        distinct: ['resource']
    });

    const orphanedResources = allDefaultPerms
        .filter(p => !resources.includes(p.resource))
        .map(p => p.resource);

    if (orphanedResources.length > 0) {
        console.log(`⚠️  Found ${orphanedResources.length} orphaned resources:`, orphanedResources);
        result.securityIssues.push(`Orphaned resources in permissions: ${orphanedResources.join(', ')}`);
    } else {
        console.log('✅ No orphaned resources found');
    }

    // 3. Route Protection Analysis
    console.log('\n🛡️  3. ROUTE PROTECTION ANALYSIS');
    console.log('-'.repeat(80));

    const routesDir = path.join(process.cwd(), 'server', 'routes');
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    let totalRoutes = 0;
    let protectedRoutes = 0;
    let publicRoutes = 0;
    let unprotectedRoutes: string[] = [];

    for (const file of routeFiles) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
        const routeMatches = content.match(/router\.(get|post|put|delete)\(/g) || [];
        totalRoutes += routeMatches.length;

        const authMatches = content.match(/authMiddleware/g) || [];
        const requireRoleMatches = content.match(/requireRole/g) || [];
        const requirePermMatches = content.match(/requirePermission/g) || [];

        protectedRoutes += authMatches.length;

        if (authMatches.length === 0 && routeMatches.length > 0) {
            unprotectedRoutes.push(file);
        }
    }

    publicRoutes = totalRoutes - protectedRoutes;

    console.log(`Total Routes: ${totalRoutes}`);
    console.log(`Protected Routes: ${protectedRoutes} (${(protectedRoutes / totalRoutes * 100).toFixed(1)}%)`);
    console.log(`Public Routes: ${publicRoutes} (${(publicRoutes / totalRoutes * 100).toFixed(1)}%)`);

    if (unprotectedRoutes.length > 0) {
        console.log(`⚠️  Files with unprotected routes:`, unprotectedRoutes);
        result.recommendations.push(`Review unprotected routes in: ${unprotectedRoutes.join(', ')}`);
    }

    // 4. Data Filtering Check
    console.log('\n🔎 4. DATA FILTERING SECURITY CHECK');
    console.log('-'.repeat(80));

    const servicesDir = path.join(process.cwd(), 'server', 'services');
    const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

    let servicesWithRoleFiltering = 0;
    let servicesWithoutRoleFiltering = 0;

    for (const file of serviceFiles) {
        const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');

        if (content.includes('userRole') || content.includes('userId')) {
            servicesWithRoleFiltering++;
        } else {
            servicesWithoutRoleFiltering++;
        }
    }

    console.log(`Services with role-based filtering: ${servicesWithRoleFiltering}`);
    console.log(`Services without filtering: ${servicesWithoutRoleFiltering}`);

    // 5. Database Stats
    console.log('\n📊 5. DATABASE STATISTICS');
    console.log('-'.repeat(80));

    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.rolePermission.count();
    const defaultPermCount = await prisma.defaultRolePermission.count();

    console.log(`Total Users: ${userCount}`);
    console.log(`Total Roles: ${roleCount}`);
    console.log(`Role Permissions: ${permissionCount}`);
    console.log(`Default Permissions: ${defaultPermCount}`);

    const usersByRole = await prisma.user.groupBy({
        by: ['roleId'],
        _count: true
    });

    console.log('\nUsers by Role:');
    for (const group of usersByRole) {
        const role = await prisma.role.findUnique({ where: { id: group.roleId } });
        console.log(`  - ${role?.name}: ${group._count} users`);
    }

    // 6. Critical Security Checks
    console.log('\n🚨 6. CRITICAL SECURITY CHECKS');
    console.log('-'.repeat(80));

    // Check for users without roles
    const usersWithoutRole = await prisma.user.count({
        where: { roleId: null }
    });

    if (usersWithoutRole > 0) {
        console.log(`⚠️  ${usersWithoutRole} users without role assignment!`);
        result.securityIssues.push(`${usersWithoutRole} users have no role assigned`);
    } else {
        console.log('✅ All users have roles assigned');
    }

    // Check for inactive roles with users
    const inactiveRolesWithUsers = await prisma.role.findMany({
        where: {
            isActive: false,
            users: { some: {} }
        },
        include: { _count: { select: { users: true } } }
    });

    if (inactiveRolesWithUsers.length > 0) {
        console.log(`⚠️  Inactive roles still have users:`);
        inactiveRolesWithUsers.forEach(role => {
            console.log(`    ${role.name}: ${role._count.users} users`);
        });
        result.securityIssues.push(`Inactive roles have ${inactiveRolesWithUsers.length} users`);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Security Issues Found: ${result.securityIssues.length}`);
    console.log(`Recommendations: ${result.recommendations.length}`);

    if (result.securityIssues.length > 0) {
        console.log('\n🚨 SECURITY ISSUES:');
        result.securityIssues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }

    if (result.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        result.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    }

    if (result.securityIssues.length === 0 && result.recommendations.length === 0) {
        console.log('\n✅ System appears secure and properly configured!');
    }

    return result;
}

comprehensiveAnalysis()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('Analysis error:', error);
        prisma.$disconnect();
        process.exit(1);
    });
