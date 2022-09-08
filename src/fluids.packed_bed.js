
let __all__ = ['dP_packed_bed', 'dP_packed_bed_methods', 'Ergun', 'Kuo_Nydegger', 'Jones_Krier', 'Carman', 'Hicks',
           'Brauer', 'KTA', 'Erdim_Akgiray_Demir', 'Fahien_Schriver',
           'Tallmadge', 'Idelchik',
           'Harrison_Brunner_Hecker', 'Montillet_Akkari_Comiti', 'Guo_Sun',
            'voidage_Benyahia_Oneil',
           'voidage_Benyahia_Oneil_spherical', 'voidage_Benyahia_Oneil_cylindrical'];
export function Ergun({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (150 + 1.75*(Re/(1-voidage)))*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Kuo_Nydegger({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (276.23 + 5.05*(Re/(1-voidage))**0.87)*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Tallmadge({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (150.0 + 4.2*(Re/(1-voidage))**(5.0/6.0))*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Jones_Krier({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (150 + 3.89*(Re/(1-voidage))**0.87)*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Carman({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (180 + 2.871*(Re/(1-voidage))**0.9)*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Hicks({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = 6.8*(1-voidage)**1.2/Re**0.2/voidage**3;
    return fp*rho*vs**2*L/dp;
}
export function Brauer({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (160 + 3.1*(Re/(1-voidage))**0.9)*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function KTA({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = dp*rho*vs/mu;
    let fp = (160 + 3*(Re/(1-voidage))**0.9)*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Erdim_Akgiray_Demir({dp, voidage, vs, rho, mu, L=1.0}) {
    let Rem = dp*rho*vs/mu/(1-voidage);
    let fv = 160 + 2.81*Rem**0.904;
    return fv*(mu*vs*L/dp**2)*(1-voidage)**2/voidage**3;
}
export function Fahien_Schriver({dp, voidage, vs, rho, mu, L=1.0}) {
    let Rem = dp*rho*vs/mu/(1-voidage);
    let q = Math.exp(-(voidage**2)*(1-voidage)/12.6*Rem);
    let f1L = 136/(1-voidage)**0.38;
    let f1T = 29/((1-voidage)**1.45*voidage**2);
    let f2 = 1.87*voidage**0.75/(1-voidage)**0.26;
    let fp = (q*f1L/Rem + (1-q)*(f2 + f1T/Rem))*(1-voidage)/voidage**3;
    return fp*rho*vs**2*L/dp;
}
export function Idelchik({dp, voidage, vs, rho, mu, L=1.0}) {
    let Re = rho*vs*dp/mu/(1-voidage);
    Re = (0.45/Math.sqrt(voidage))*Re;
    let right = 0.765/voidage**4.2*(30./Re + 3./Re**0.7 + 0.3);
    let left = dp/L/rho/vs**2;
    return right/left;
}
export function Harrison_Brunner_Hecker({dp, voidage, vs, rho, mu, L=1, Dt=null}) {
    let Re = dp*rho*vs/mu;
    let A, B;
    if( Dt === null ) { [A, B] = [1.0, 1.0]; }
    else {
        A = (1 + Math.PI*dp/(6*(1-voidage)*Dt))**2;
        B = 1 - Math.PI**2*dp/24/Dt*(1 - dp/(2*Dt));
    }
    let fp = (119.8*A + 4.63*B*(Re/(1-voidage))**(5/6.))*(1-voidage)**2/(voidage**3*Re);
    return fp*rho*vs**2*L/dp;
}
export function Montillet_Akkari_Comiti({dp, voidage, vs, rho, mu, L=1, Dt=null}) {
    let Re = rho*vs*dp/mu;
    let a, Dterm;
    if( voidage < 0.4 ) { a = 0.061; }
    else { a = 0.05; }
    if( Dt === null || Dt/dp > 50 ) { Dterm = 2.2; }
    else { Dterm = (Dt/dp)**0.2; }
    let right = a*Dterm*(1000./Re + 60/Math.sqrt(Re) + 12);
    let left = dp/L/rho/vs**2*voidage**3/(1-voidage);
    return right/left;
}
export function Guo_Sun({dp, voidage, vs, rho, mu, Dt, L=1.0}) {
    //  2 < D/d < 3, particles in contact with the wall tend to form a highly ordered ring structure.
    let Rem = dp*rho*vs/mu/(1-voidage);
    let ratio = Dt !== null ? dp/Dt : 3.5; // Never ran
    let fv = 180 + (9.5374*ratio - 2.8054)*Rem**0.97;
    return fv*(mu*vs*L/dp**2)*(1-voidage)**2/voidage**3;
}
// Format: Nice name : (formula, uses_dt)
let packed_beds_correlations = {
    'Ergun': [Ergun, false],
    'Tallmadge': [Tallmadge, false],
    'Kuo & Nydegger': [Kuo_Nydegger, false],
    'Jones & Krier': [Jones_Krier, false],
    'Carman': [Carman, false],
    'Hicks': [Hicks, false],
    'Brauer': [Brauer, false],
    'KTA': [KTA, false],
    'Fahien & Schriver': [Fahien_Schriver, false],
    'Idelchik': [Idelchik, false],
    'Erdim, Akgiray & Demir': [Erdim_Akgiray_Demir, false],
    'Harrison, Brunner & Hecker': [Harrison_Brunner_Hecker, true],
    'Montillet, Akkari & Comiti': [Montillet_Akkari_Comiti, true],
    'Guo, Sun, Zhang, Ding & Liu': [Guo_Sun, true]
};
export function dP_packed_bed_methods({dp, voidage, vs, rho, mu, L=1.0, Dt=null, check_ranges=false}) {
    let methods = [];
    if( (dp !== null && voidage !== null && vs !== null
        && rho !== null && mu !== null && L !== null) ) {
        if( Dt !== null ) { methods = ['Harrison, Brunner & Hecker', 'Montillet, Akkari & Comiti', 'Guo, Sun, Zhang, Ding & Liu']; }
        methods = methods.concat(['Erdim, Akgiray & Demir', 'Idelchik', 'Fahien & Schriver',
                        'KTA', 'Brauer', 'Hicks', 'Carman', 'Jones & Krier', 'Kuo & Nydegger',
                        'Tallmadge', 'Ergun']);
    }
    return methods;
}
export function dP_packed_bed({dp, voidage, vs, rho, mu, L=1, Dt=null, sphericity=null,
                  Method=null}) {
    let Method2;
    if( Method === null ) { Method2 = Dt !== null ? 'Harrison, Brunner & Hecker' : 'Erdim, Akgiray & Demir'; }
    else { Method2 = Method; }
    if( dp !== null && sphericity !== null ) { dp = dp*sphericity; }
    if( Method2 === "Ergun" ) { return Ergun( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Tallmadge" ) { return Tallmadge( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Kuo & Nydegger" ) { return Kuo_Nydegger( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Jones & Krier" ) { return Jones_Krier( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Carman" ) { return Carman( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Hicks" ) { return Hicks( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Brauer" ) { return Brauer( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "KTA" ) { return KTA( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Erdim, Akgiray & Demir" ) { return Erdim_Akgiray_Demir( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Fahien & Schriver" ) { return Fahien_Schriver( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Idelchik" ) { return Idelchik( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L });}
    else if( Method2 === "Harrison, Brunner & Hecker" ) { return Harrison_Brunner_Hecker( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L, Dt: Dt });}
    else if( Method2 === "Montillet, Akkari & Comiti" ) { return Montillet_Akkari_Comiti( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L, Dt: Dt });}
    else if( Method2 === "Guo, Sun, Zhang, Ding & Liu" ) { return Guo_Sun( {dp: dp, voidage: voidage, vs: vs, rho: rho, mu: mu, L: L, Dt: Dt });}
    else { throw new Error( 'ValueError','Unrecognized method' ); }
//import matplotlib.pyplot as plt
//import numpy as np
//
//voidage = 0.4
//rho = 1000.
//mu = 1E-3
//vs = 0.1
//dp = 0.0001
//methods = dP_packed_bed(dp, voidage, vs, rho, mu, L=1, AvailableMethods=True)
//dps = np.logspace(-4, -1, 100)
//
//for method in methods:
//    dPs = [dP_packed_bed(dp, voidage, vs, rho, mu, Method=method) for dp in dps]
//    plt.semilogx(dps, dPs, label=method)
//plt.legend()
//plt.show()
////// Voidage correlations
}
export function voidage_Benyahia_Oneil({Dpe, Dt, sphericity}) { return 0.1504 + 0.2024/sphericity + 1.0814/(Dt/Dpe + 0.1226)**2; }
export function voidage_Benyahia_Oneil_spherical({Dp, Dt}) { return 0.390 + 1.740/(Dt/Dp + 1.140)**2; }
export function voidage_Benyahia_Oneil_cylindrical({Dpe, Dt, sphericity}) { return 0.373 + 1.703/(Dt/Dpe + 0.611)**2; }
