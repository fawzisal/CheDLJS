import { g } from './fluids.constants.js' ;
import { Reynolds } from './fluids.core.js' ;
import { sec } from 'mathjs'; //secant
import { range } from './fluids.numerics_init.js'; //secant
let __all__ = ['drag_sphere', 'drag_sphere_methods', 'v_terminal', 'integrate_drag_sphere', 'time_v_terminal_Stokes', 'Stokes', 'Barati', 'Barati_high', 'Rouse', 'Engelund_Hansen', 'Clift_Gauvin', 'Morsi_Alexander', 'Graf', 'Flemmer_Banks', 'Khan_Richardson', 'Swamee_Ojha', 'Yen', 'Haider_Levenspiel', 'Cheng', 'Terfous', 'Mikhailov_Freire', 'Clift', 'Ceylan', 'Almedeij', 'Morrison', 'Song_Xu'];
export function Stokes(Re) { return 24./Re; }
export function Barati(Re) {
    let Re_inv = 1.0/Re;
    let Cd = (5.4856E9*Math.tanh(4.3774E-9*Re_inv) + 0.0709*Math.tanh(700.6574*Re_inv) + 0.3894*Math.tanh(74.1539*Re_inv) - 0.1198*Math.tanh(7429.0843*Re_inv) + 1.7174*Math.tanh(9.9851/(Re + 2.3384)) + 0.4744);
    return Cd;
}
export function Barati_high(Re) {
    let Re2 = Re*Re;
    let t0 = 1.0/Re;
    let t1 = Re*(1.0/6530.);
    let t2 = Re*(1.0/1620);
    let t3 = Math.log10(Re2 + 10.7563);
    let t4 = 1.0/(Re+Re2);
    t4 *= t4;
    t4 *= t4;
    let tanhRe = Math.tanh(Re);
    let Cd = (8E-6*(t1*t1 + tanhRe - 8.0*Math.log10(Re)) - 0.4119*Math.exp(-2.08E43*t4) - 2.1344*Math.exp(-t0*(t3*t3 + 9.9867)) + 0.1357*Math.exp(-t0*(t2*t2 + 10370.)) - 8.5E-3*t0*(2.0*Math.log10(Math.tanh(tanhRe)) - 2825.7162) + 2.4795);
    return Cd;
}
export function Rouse(Re) { return 24./Re + 3/Math.sqrt(Re) + 0.34; }
export function Engelund_Hansen(Re) { return 24./Re + 1.5; }
export function Clift_Gauvin(Re) { return 24./Re*(1 + 0.152*Re**0.677) + 0.417/(1 + 5070*Re**-0.94); }
export function Morsi_Alexander(Re) {
    if( Re < 0.1 ) { return 24./Re; }
    else if( Re < 1 ) { return 22.73/Re + 0.0903/Re**2 + 3.69; }
    else if( Re < 10 ) { return 29.1667/Re - 3.8889/Re**2 + 1.222; }
    else if( Re < 100 ) { return 46.5/Re - 116.67/Re**2 + 0.6167; }
    else if( Re < 1000 ) { return 98.33/Re - 2778./Re**2 + 0.3644; }
    else if( Re < 5000 ) { return 148.62/Re - 4.75E4/Re**2 + 0.357; }
    else if( Re < 10000 ) { return -490.546/Re + 57.87E4/Re**2 + 0.46; }
    else { return -1662.5/Re + 5.4167E6/Re**2 + 0.5191; }
}
export function Graf(Re) { return 24./Re + 7.3/(1 + Math.sqrt(Re)) + 0.25; }
export function Flemmer_Banks(Re) {
    let E = 0.383*Re**0.356 - 0.207*Re**0.396 - 0.143/(1 + (Math.log10(Re))**2);
    return 24./Re*10**E;
}
export function Khan_Richardson(Re) { return (2.49*Re**-0.328 + 0.34*Re**0.067)**3.18; }
export function Swamee_Ojha(Re) { return 0.5*Math.sqrt(Math.sqrt(16*((24./Re)**1.6 + (130./Re)**0.72)**2.5 + 1.0/Math.sqrt(Math.sqrt((40000./Re)**2 + 1)))); }
export function Yen(Re) { return 24./Re*(1 + 0.15*Math.sqrt(Re) + 0.017*Re) - 0.208/(1 + 1E4*1.0/Math.sqrt(Re)); }
export function Haider_Levenspiel(Re) { return 24./Re*(1 + 0.1806*Re**0.6459) + (0.4251/(1 + 6880.95/Re)); }
export function Cheng(Re) { return 24./Re*(1. + 0.27*Re)**0.43 + 0.47*(1. - Math.exp(-0.04*Re**0.38)); }
export function Terfous(Re) { return 2.689 + 21.683/Re + 0.131/Re**2 - 10.616/Re**0.1 + 12.216/Re**0.2; }
export function Mikhailov_Freire(Re) { return (3808.*((1617933./2030.) + (178861./1063.)*Re + (1219./1084.)*Re**2) /(681.*Re*((77531./422.) + (13529./976.)*Re - (1./71154.)*Re**2))); }
export function Clift(Re) {
    if( Re < 0.01 ) { return 24./Re + 3/16.; }
    else if( Re < 20 ) { return 24./Re*(1 + 0.1315*Re**(0.82 - 0.05*Math.log10(Re))); }
    else if( Re < 260 ) { return 24./Re*(1 + 0.1935*Re**(0.6305)); }
    else if( Re < 1500 ) { return 10**(1.6435 - 1.1242*Math.log10(Re) + 0.1558*(Math.log10(Re))**2); }
    else if( Re < 12000 ) { return 10**(-2.4571 + 2.5558*Math.log10(Re) - 0.9295*(Math.log10(Re))**2 + 0.1049*Math.log10(Re)**3); }
    else if( Re < 44000 ) { return 10**(-1.9181 + 0.6370*Math.log10(Re) - 0.0636*(Math.log10(Re))**2); }
    else if( Re < 338000 ) { return 10**(-4.3390 + 1.5809*Math.log10(Re) - 0.1546*(Math.log10(Re))**2); }
    else if( Re < 400000 ) { return 29.78 - 5.3*Math.log10(Re); }
    else { return 0.19*Math.log10(Re) - 0.49; }
}
export function Ceylan(Re) { return (1 - 0.5*Math.exp(0.182) + 10.11*Re**(-2/3.)*Math.exp(0.952/Math.sqrt(Math.sqrt(Re))) - 0.03859*Re**(-4/3.)*Math.exp(1.30/Math.sqrt(Re)) + 0.037E-4*Re*Math.exp(-0.125E-4*Re) - 0.116E-10*Re**2*Math.exp(-0.444E-5*Re)); }
export function Almedeij(Re) {
    let phi4 = ((6E-17*Re**2.63)**-10 + 0.2**-10)**-1;
    let phi3 = (1.57E8*Re**-1.625)**10;
    let phi2 = ((0.148*Re**0.11)**-10 + 0.5**-10)**-1;
    let phi1 = (24*Re**-1)**10 + (21*Re**-0.67)**10 + (4*Re**-0.33)**10 + 0.4**10;
    return (1/((phi1 + phi2)**-1 + phi3**-1) + phi4)**0.1;
}
export function Morrison(Re) { return (24./Re + 2.6*Re/5./(1 + (Re/5.)**1.52) + 0.411*(Re/263000.)**-7.94/(1 + (Re/263000.)**-8) + Re**0.8/461000.); }
export function Song_Xu({Re, sphericity=1., S=1.}) { return 24/(Re*sphericity**0.65*S**0.3)*(1+0.35*Re)**0.44; }
export let drag_sphere_correlations = {
    'Stokes': [Stokes, null, 0.3],
    'Barati': [Barati, null, 2E5],
    'Barati_high': [Barati_high, null, 1E6],
    'Rouse': [Rouse, null, 2E5],
    'Engelund_Hansen': [Engelund_Hansen, null, 2E5],
    'Clift_Gauvin': [Clift_Gauvin, null, 2E5],
    'Morsi_Alexander': [Morsi_Alexander, null, 2E5],
    'Graf': [Graf, null, 2E5],
    'Flemmer_Banks': [Flemmer_Banks, null, 2E5],
    'Khan_Richardson': [Khan_Richardson, null, 2E5],
    'Swamee_Ojha': [Swamee_Ojha, null, 1.5E5],
    'Yen': [Yen, null, 2E5],
    'Haider_Levenspiel': [Haider_Levenspiel, null, 2E5],
    'Cheng': [Cheng, null, 2E5],
    'Terfous': [Terfous, 0.1, 5E4],
    'Mikhailov_Freire': [Mikhailov_Freire, null, 118300],
    'Clift': [Clift, null, 1E6],
    'Ceylan': [Ceylan, 0.1, 1E6],
    'Almedeij': [Almedeij, null, 1E6],
    'Morrison': [Morrison, null, 1E6],
    'Song_Xu': [Song_Xu, null, 1E3],
};
export function drag_sphere_methods({Re, check_ranges=true}) {
    let methods = [];
    for (let key in drag_sphere_correlations){
            var [func, Re_min, Re_max] = drag_sphere_correlations[key];
            if (((Re_min == null || Re > Re_min) && (Re_max == null || Re < Re_max)) || !check_ranges) {
                methods.push(key);
            }
        }
    return methods;
}
export function drag_sphere({Re, Method=null}) {
    if( Method === null ) {
        if( Re > 0.1 ) {
            // Smooth transition point between the two models
            if( Re <= 212963.26847812787 ) { return Barati(Re); }
            else if( Re <= 1E6 ) { return Barati_high(Re); }
            else { throw new Error( 'ValueError - No models implement a solution for Re > 1E6' ); }
        }
        else if( Re >= 0.01 ) {
            // Re from 0.01 to 0.1
            let ratio = (Re - 0.01)/(0.1 - 0.01);
            // Ensure a smooth transition by linearly switching to Stokes' law
            return ratio*Barati(Re) + (1-ratio)*Stokes(Re);
        }
        else { return Stokes(Re); }
    }
    if( Method === "Stokes" ) { return Stokes(Re); }
    else if( Method === "Barati" ) { return Barati(Re); }
    else if( Method === "Barati_high" ) { return Barati_high(Re); }
    else if( Method === "Rouse" ) { return Rouse(Re); }
    else if( Method === "Engelund_Hansen" ) { return Engelund_Hansen(Re); }
    else if( Method === "Clift_Gauvin" ) { return Clift_Gauvin(Re); }
    else if( Method === "Morsi_Alexander" ) { return Morsi_Alexander(Re); }
    else if( Method === "Graf" ) { return Graf(Re); }
    else if( Method === "Flemmer_Banks" ) { return Flemmer_Banks(Re); }
    else if( Method === "Khan_Richardson" ) { return Khan_Richardson(Re); }
    else if( Method === "Swamee_Ojha" ) { return Swamee_Ojha(Re); }
    else if( Method === "Yen" ) { return Yen(Re); }
    else if( Method === "Haider_Levenspiel" ) { return Haider_Levenspiel(Re); }
    else if( Method === "Cheng" ) { return Cheng(Re); }
    else if( Method === "Terfous" ) { return Terfous(Re); }
    else if( Method === "Mikhailov_Freire" ) { return Mikhailov_Freire(Re); }
    else if( Method === "Clift" ) { return Clift(Re); }
    else if( Method === "Ceylan" ) { return Ceylan(Re); }
    else if( Method === "Almedeij" ) { return Almedeij(Re); }
    else if( Method === "Morrison" ) { return Morrison(Re); }
    else if( Method === "Song_Xu" ) { return Song_Xu(Re); }
    else { throw new Error( 'ValueError - Unrecognized method' ); }
}
export function _v_terminal_err({V, Method, Re_almost, main}) {
    let Cd = drag_sphere(Re_almost*V, { Method: Method });
    return V - Math.sqrt(main/Cd);
}
export function v_terminal({D, rhop, rho, mu, Method=null}) {
    let v_lam = g*D*D*(rhop-rho)/(18*mu);
    let Re_lam = Reynolds( {V: v_lam, D: D, rho: rho, mu: mu });
    if( Re_lam < 0.01 || Method === 'Stokes' ) { return v_lam; }
    let Re_almost = rho*D/mu;
    let main = 4/3.*g*D*(rhop-rho)/rho;
    let V_max = 1E6/rho/D*mu;  // where the correlation breaks down, Re=1E6
    // Begin the solver with 1/100 th the velocity possible at the maximum
    // Reynolds number the correlation is good for
    return sec(_v_terminal_err, V_max*1e-2, { xtol: 1E-12, args: [Method, Re_almost, main] });
}
export function time_v_terminal_Stokes({D, rhop, rho, mu, V0, tol=1e-14}) {
    if( tol < 1e-17 ) { tol = 2e-17; }
    let term = D*D*g*rho - D*D*g*rhop;
    let denominator = term + 18.*mu*V0;
    let v_term_base = g*D*D*(rhop-rho)/(18.*mu);
    let constant = D*D*rhop/mu*-1.0/18.;
    for( let i of range(50) ) {
        try {
            if( v_term_base < V0 ) { let v_term = v_term_base*(1.0 + tol); }
            else { let v_term = v_term_base*(1.0 - tol); }
            let numerator = term + 18.*mu*v_term;
            return Math.log(numerator/denominator)*constant;
        } catch( e ) {
            tol = tol + tol;
            if( tol > 0.01 ) { throw new Error( 'ValueError - Could not find a solution' ); }
        }
    }
    throw new Error( 'ValueError - Could not find a solution' );
}
// TODO: replace numpy with a JS equivalent
// function integrate_drag_sphere({D, rhop, rho, mu, t, V=0, Method=null, distance=false}) {
//     const { odeint, cumtrapz } = require( './scipy.integrate' );
//     const numpy as np = require( './numpy as np' );
//     let laminar_initial = Reynolds( {V: V, rho: rho, D: D, mu: mu }) < 0.01;
//     let v_laminar_end_assumed = v_terminal( {D: D, rhop: rhop, rho: rho, mu: mu, Method: Method });
//     let laminar_end = Reynolds( {V: v_laminar_end_assumed, rho: rho, D: D, mu: mu }) < 0.01;
//     if( Method === 'Stokes' || (laminar_initial && laminar_end and Method === null) ) {
//         try {
//             let t1 = 18.0*mu/(D*D*rhop);
//             let t2 = g*(rhop-rho)/rhop;
//             let V_end = Math.exp(-t1*t)*(t1*V + t2*(Math.exp(t1*t) - 1.0))/t1;
//             let x_end = Math.exp(-t1*t)*(V*t1*(Math.exp(t1*t) - 1.0) + t2*Math.exp(t1*t)*(t1*t - 1.0) + t2)/(t1*t1);
//             if( distance ) { return V_end, x_end; }
//             else { return V_end; }
//         } catch( e ) /* OverflowError */ {
//             // It is only necessary to integrate to terminal velocity
//             let t_to_terminal = time_v_terminal_Stokes(D, rhop, rho, mu, { V0: V, tol: 1e-9 });
//             if( t_to_terminal > t ) { throw new Error( 'ValueError - Should never happen' ); }
//             V_end, x_end = integrate_drag_sphere( {D: D, rhop: rhop, rho: rho, mu: mu, t: t_to_terminal, V: V, Method: 'Stokes', distance: true });
//             // terminal velocity has been reached - V does not change, but x does
//             // No reason to believe this isn't working even though it isn't
//             // matching the ode solver
//             if( distance ) { return V_end, x_end + V_end*(t - t_to_terminal); }
//             else { return V_end; }
//         }
//     }
//     let Re_ish = rho*D/mu;
//     let c1 = g*(rhop-rho)/rhop;
//     let c2 = -0.75*rho/(D*rhop);
//     function dv_dt({V, t}) {
//         if( V === 0 ) {
//             // 64/Re goes to infinity, but gets multiplied by 0 squared.
//             let t2 = 0.0;
//         } else {
//             t2 = c2*V*V*drag_sphere(float(Re_ish*V), { Method: Method });
//         }
//         return c1 + t2;
//     }
//     // Number of intervals for the solution to be solved for; the integrator
//     // doesn't care what we give it, but a large number of intervals are needed
//     // For an accurate integration of the particle's distance traveled
//     let pts = 1000 if distance else 2;
//     let ts = np.linspace(0, t, pts);
//     // Perform the integration
//     let Vs = odeint(dv_dt, [V], ts);
//     //
//     let V_end = float(Vs[Vs.length-1]);
//     if( distance ) {
//         // Calculate the distance traveled
//         let x = float(cumtrapz(np.ravel(Vs), ts)[-1]);
//         return V_end, x;
//     } else {
//         return V_end;
//     }
// }
