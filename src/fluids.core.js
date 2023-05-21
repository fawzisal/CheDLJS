import { float, listZip } from './_pyjs.js';
// if (typeof g == 'undefined') {
import { g as g_const, R } from './fluids.constants.js' ;
// }
let __all__ = ['Reynolds', 'Prandtl', 'Grashof', 'Nusselt', 'Sherwood', 'Rayleigh', 'Schmidt', 'Peclet_heat', 'Peclet_mass', 'Fourier_heat', 'Fourier_mass', 'Graetz_heat', 'Lewis', 'Weber', 'Mach', 'Knudsen', 'Bond', 'Dean', 'Morton', 'Froude', 'Froude_densimetric', 'Strouhal', 'Biot', 'Stanton', 'Euler', 'Cavitation', 'Eckert', 'Jakob', 'Power_number', 'Stokes_number', 'Drag', 'Capillary', 'Bejan_L', 'Bejan_p', 'Boiling', 'Confinement', 'Archimedes', 'Ohnesorge', 'Suratman', 'Hagen', 'thermal_diffusivity', 'c_ideal_gas', 'relative_roughness', 'nu_mu_converter', 'gravity', 'K_from_f', 'K_from_L_equiv', 'L_equiv_from_K', 'L_from_K', 'dP_from_K', 'head_from_K', 'head_from_P', 'f_from_K', 'P_from_head', 'Eotvos', 'C2K', 'K2C', 'F2C', 'C2F', 'F2K', 'K2F', 'C2R', 'K2R', 'F2R', 'R2C', 'R2K', 'R2F', 'PY3', ];
export function thermal_diffusivity({k, rho, Cp}) { return k/(rho*Cp); }
////// Ideal gas fluid properties
export function c_ideal_gas({T, k, MW}) {
    let Rspecific = R*1000/MW;
    return Math.sqrt(k*Rspecific*T);
}
////// Dimensionless groups
export function Reynolds({V, D, rho=null, mu=null, nu=null}) {
    if( rho !== null && mu !== null ) { nu = mu/rho; }
    else if( nu === null ) { throw new Error( 'ValueError','Either density and viscosity, or dynamic viscosity,  is needed' ) };
    return V*D/nu;
}
export function Peclet_heat({V, L, rho=null, Cp=null, k=null, alpha=null}) {
    if( rho !== null && Cp !== null && k !== null ) { alpha =  k/(rho*Cp); }
    else if( alpha === null ) { throw new Error( 'ValueError','Either heat capacity and thermal conductivity and density, or thermal diffusivity is needed' ) };
    return V*L/alpha;
}
export function Peclet_mass({V, L, D}) { return V*L/D; }
export function Fourier_heat({t, L, rho=null, Cp=null, k=null, alpha=null}) {
    if( rho !== null && Cp !== null && k !== null ) { alpha =  k/(rho*Cp); }
    else if( alpha === null ) { throw new Error( 'ValueError','Either heat capacity and thermal conductivity and density, or thermal diffusivity is needed' ) };
    return t*alpha/(L*L);
}
export function Fourier_mass({t, L, D}) { return t*D/(L*L); }
export function Graetz_heat({V, D, x, rho=null, Cp=null, k=null, alpha=null}) {
    if( rho !== null && Cp !== null && k !== null ) { alpha = k/(rho*Cp); }
    else if( alpha === null ) { throw new Error( 'ValueError','Either heat capacity and thermal conductivity and density, or thermal diffusivity is needed' ) };
    return V*D*D/(x*alpha);
}
export function Schmidt({D, mu=null, nu=null, rho=null}) {
    if( rho !== null && mu !== null ) { return mu/(rho*D); }
    else if( nu !== null ) { return nu/D; } else { throw new Error( 'ValueError','Insufficient information provided for Schmidt number calculation' ) };
}
export function Lewis({D=null, alpha=null, Cp=null, k=null, rho=null}) {
    if( k !== null && Cp !== null && rho !== null ) { alpha = k/(rho*Cp); }
    else if( alpha === null ) { throw new Error( 'ValueError','Insufficient information provided for Le calculation' ) };
    return alpha/D;
}
export function Weber({V, L, rho, sigma}) { return V*V*L*rho/sigma; }
export function Mach({V, c}) { return V/c; }
export function Confinement({D, rhol, rhog, sigma, g=g_const}) { return Math.sqrt(sigma/(g*(rhol-rhog)))/D; }
export function Morton({rhol, rhog, mul, sigma, g=g_const}) {
    let mul2 = mul*mul;
    return g*mul2*mul2*(rhol - rhog)/(rhol*rhol*sigma*sigma*sigma);
}
export function Knudsen({path, L}) { return path/L; }
export function Prandtl({Cp=null, k=null, mu=null, nu=null, rho=null, alpha=null}) {
    if( k !== null && Cp !== null && mu !== null ) { return Cp*mu/k; }
    else if( nu !== null && rho !== null && Cp !== null && k !== null ) { return nu*rho*Cp/k; } else if( nu !== null && alpha !== null ) { return nu/alpha; } else { throw new Error( 'ValueError','Insufficient information provided for Pr calculation' ) };
}
export function Grashof({L, beta, T1, T2=0, rho=null, mu=null, nu=null, g=g_const}) {
    if( rho !== null && mu !== null ) { nu = mu/rho; }
    else if( nu === null ) { throw new Error( 'ValueError','Either density and viscosity, or dynamic viscosity,  is needed' ) };
    return g*beta*Math.abs(T2-T1)*L*L*L/(nu*nu);
}
export function Bond({rhol, rhog, sigma, L}) { return (g_const*(rhol-rhog)*L*L/sigma); }
export let Eotvos = Bond;
export function Rayleigh({Pr, Gr}) { return Pr*Gr; }
export function Froude({V, L, g=g_const, squared=false}) {
    let Fr = V/Math.sqrt(L*g);
    if( squared ) { Fr *= Fr; }
    return Fr;
}
export function Froude_densimetric({V, L, rho1, rho2, heavy=true, g=g_const}) {
    let rho3;
    if( heavy ) { rho3 = rho1; }
    else { rho3 = rho2; };
    return V/(Math.sqrt(g*L))*Math.sqrt(rho3/(rho1 - rho2));
}
export function Strouhal({f, L, V}) { return f*L/V; }
export function Nusselt({h, L, k}) { return h*L/k; }
export function Sherwood({K, L, D}) { return K*L/D; }
export function Biot({h, L, k}) { return h*L/k; }
export function Stanton({h, V, rho, Cp}) { return h/(V*rho*Cp); }
export function Euler({dP, rho, V}) { return dP/(rho*V*V); }
export function Cavitation({P, Psat, rho, V}) { return (P-Psat)/(0.5*rho*V*V); }
export function Eckert({V, Cp, dT}) { return V*V/(Cp*dT); }
export function Jakob({Cp, Hvap, Te}) { return Cp*Te/Hvap; }
export function Power_number({P, L, N, rho}) { return P/(rho*N*N*N*L**5); }
export function Drag({F, A, V, rho}) { return F/(0.5*A*rho*V*V); }
export function Stokes_number({V, Dp, D, rhop, mu}) { return rhop*V*(Dp*Dp)/(18.0*mu*D); }
export function Capillary({V, mu, sigma}) { return V*mu/sigma; }
export function Archimedes({L, rhof, rhop, mu, g=g_const}) { return L*L*L*rhof*(rhop-rhof)*g/(mu*mu); }
export function Ohnesorge({L, rho, mu, sigma}) { return mu/Math.sqrt(L*rho*sigma); }
export function Suratman({L, rho, mu, sigma}) { return rho*sigma*L/(mu*mu); }
export function Hagen({Re, fd}) { return 0.5*fd*Re*Re; }
export function Bejan_L({dP, L, mu, alpha}) { return dP*L*L/(alpha*mu); }
export function Bejan_p({dP, K, mu, alpha}) { return dP*K/(alpha*mu); }
export function Boiling({G, q, Hvap}) { return q/(G*Hvap); }
export function Dean({Re, Di, D}) { return Math.sqrt(Di/D)*Re; }
export function relative_roughness({D, roughness=1.52e-06}) { return roughness/D; }
////// Misc utilities
export function nu_mu_converter({rho, mu=null, nu=null}) {
    if( (nu !== null && mu !== null) || rho === null || (nu === null && mu === null) ) { throw new Error( 'ValueError','Inputs must be rho and one of mu and nu.' ); }
    if( mu !== null ) { return mu/rho; }
    else { return nu*rho; };
}
export function gravity({latitude, H}) {
    let lat = latitude*Math.PI/180;
    return 9.780356*(1+0.0052885*Math.sin(lat)**2 -0.0000059*Math.sin(2*lat)**2)-3.086E-6*H;
}
////// Friction loss conversion functions
export function K_from_f({fd, L, D}) { return fd*L/D; }
export function f_from_K({K, L, D}) { return K*D/L; }
export function K_from_L_equiv({L_D, fd=0.015}) { return fd*L_D; }
export function L_equiv_from_K({K, fd=0.015}) { return K/fd; }
export function L_from_K({K, D, fd=0.015}) { return K*D/fd; }
export function dP_from_K({K, rho, V}) { return K*0.5*rho*V*V; }
export function head_from_K({K, V, g=g_const}) { return K*0.5*V*V/g; }
export function head_from_P({P, rho, g=g_const}) { return P/rho/g; }
export function P_from_head({head, rho, g=g_const}) { return head*rho*g; }
////// Synonyms
let alpha = thermal_diffusivity; // synonym for thermal diffusivity
let Pr = Prandtl; // Synonym
// temperature in kelvin
let zero_Celsius = 273.15;
let degree_Fahrenheit = 1.0/1.8; // only for differences
export function C2K(C) { return C + zero_Celsius; }
export function K2C(K) { return K - zero_Celsius; }
export function F2C(F) { return (F - 32.0) / 1.8; }
export function C2F(C) { return 1.8*C + 32.0; }
export function F2K(F) { return (F - 32.0)/1.8 + zero_Celsius; }
export function K2F(K) { return 1.8*(K - zero_Celsius) + 32.0; }
export function C2R(C) { return 1.8 * (C + zero_Celsius); }
export function K2R(K) { return 1.8 * K; }
export function F2R(F) { return F - 32.0 + 1.8 * zero_Celsius; }
export function R2C(Ra) { return Ra / 1.8 - zero_Celsius; }
export function R2K(Ra) { return Ra / 1.8; }
export function R2F(Ra) { return Ra - 1.8*zero_Celsius + 32.0; }
export function Engauge_2d_parser({lines, flat=false}) {
    let z_values = [];
    let x_lists = [];
    let y_lists = [];
    let working_xs = [];
    let working_ys = [];
    let new_curve = true;
    for( let line of lines ) {
        if( line.strip() === '' ) {
            new_curve = true;
        } else if( new_curve ) {
            let z = float(line.split(',')[1]);
            z_values.push(z);
            if( working_xs && working_ys ) {
                x_lists.push(working_xs);
                y_lists.push(working_ys);
            }
            working_xs = [];
            working_ys = [];
            new_curve = false;
    }
    else {
            let x, y = line.strip().split(',').map( i =>float(i) );
            working_xs.push(x);
            working_ys.push(y);
        }
    }
    x_lists.push(working_xs);
    y_lists.push(working_ys);
    if( flat ) {
        let all_zs = [];
        let all_xs = [];
        let all_ys = [];
        for( let [ z, xs, ys ] of listZip(z_values, x_lists, y_lists) ) {
            for( let [ x, y ] of listZip(xs, ys) ) {
                all_zs.push(z);
                all_xs.push(x);
                all_ys.push(y);
            }
        }
        return all_zs, all_xs, all_ys;
    }
    return z_values, x_lists, y_lists;
}
