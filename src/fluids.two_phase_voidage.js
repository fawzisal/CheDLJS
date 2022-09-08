import { radians } from './fluids.helpers.js' ;
import { g } from './fluids.constants.js' ;
import { Froude } from './fluids.core.js' ;
let __all__ = ['Thom', 'Zivi', 'Smith', 'Fauske', 'Chisholm_voidage', 'Turner_Wallis', 'homogeneous', 'Chisholm_Armand', 'Armand', 'Nishino_Yamazaki', 'Guzhov', 'Kawahara', 'Baroczy', 'Tandon_Varma_Gupta', 'Harms', 'Domanski_Didion', 'Graham', 'Yashar', 'Huq_Loth', 'Kopte_Newell_Chato', 'Steiner', 'Rouhani_1', 'Rouhani_2', 'Nicklin_Wilkes_Davidson', 'Gregory_Scott', 'Dix', 'Sun_Duffey_Peng', 'Xu_Fang_voidage', 'Woldesemayat_Ghajar', 'Lockhart_Martinelli_Xtt', 'two_phase_voidage_experimental', 'density_two_phase', 'Beattie_Whalley', 'McAdams', 'Cicchitti', 'Lin_Kwok', 'Fourar_Bories','Duckler', 'liquid_gas_voidage', 'liquid_gas_voidage_methods', 'gas_liquid_viscosity', 'gas_liquid_viscosity_methods', 'two_phase_voidage_correlations', 'liquid_gas_viscosity_correlations'];
export function Thom({x, rhol, rhog, mul, mug}) { return (1 + (1-x)/x * (rhog/rhol)**0.89 * (mul/mug)**0.18)**-1; }
//    return x*((mug/mul)**(111/1000)*(rhol/rhog)**(111/200))**1.6/(x*(((mug/mul)**(111/1000)*(rhol/rhog)**(111/200))**1.6 - 1) + 1)
export function Zivi({x, rhol, rhog}) { return (1 + (1-x)/x * (rhog/rhol)**(2/3.))**-1; }
export function Smith({x, rhol, rhog}) {
    let K = 0.4;
    let x_ratio = (1-x)/x;
    let root = Math.sqrt((rhol/rhog + K*x_ratio) / (1 + K*x_ratio));
    let alpha = (1 + (x_ratio) * (rhog/rhol) * (K + (1-K)*root))**-1;
    return alpha;
}
export function Fauske({x, rhol, rhog}) { return (1 + (1-x)/x*Math.sqrt(rhog/rhol))**-1; }
export function Chisholm_voidage({x, rhol, rhog}) {
    let S = Math.sqrt(1 - x*(1-rhol/rhog));
    let alpha = (1 + (1-x)/x*rhog/rhol*S)**-1;
    return alpha;
}
export function Turner_Wallis({x, rhol, rhog, mul, mug}) { return (1 + ((1-x)/x)**0.72 * (rhog/rhol)**0.4 * (mul/mug)**0.08)**-1; }
////// Models using the Homogeneous flow model
export function homogeneous({x, rhol, rhog}) { return 1.0/(1.0 + (1.0 - x)/x*(rhog/rhol)); }
export function Chisholm_Armand({x, rhol, rhog}) {
    let alpha_h = homogeneous(x, rhol, rhog);
    return alpha_h/(alpha_h + Math.sqrt(1-alpha_h));
}
export function Armand({x, rhol, rhog}) { return 0.833*homogeneous(x, rhol, rhog); }
export function Nishino_Yamazaki({x, rhol, rhog}) {
    let alpha_h = homogeneous(x, rhol, rhog);
    return 1 - Math.sqrt((1-x)*rhog/x/rhol)*Math.sqrt(alpha_h);
}
export function Guzhov({x, rhol, rhog, m, D}) {
    let rho_tp = ((1-x)/rhol + x/rhog)**-1;
    let G = m/(Math.PI/4*D**2);
    let V_tp = G/rho_tp;
    let Fr = Froude( {V: V_tp, L: D, squared: true }); // squaring in undone later; Fr**0.5
    let alpha_h = homogeneous(x, rhol, rhog);
    return 0.81*(1 - Math.exp(-2.2*Math.sqrt(Fr)))*alpha_h;
}
export function Kawahara({x, rhol, rhog, D}) {
    if( D > 250E-6 ) { return Armand(x, rhol, rhog); }
    else if( D > 75E-6 ) { let [C1, C2] = [0.03, 0.97]; }
    else { C1, C2 = 0.02, 0.98; }
    let alpha_h = homogeneous(x, rhol, rhog);
    return C1*Math.sqrt(alpha_h)/(1. - C2*Math.sqrt(alpha_h));
}
////// Miscellaneous correlations
export function Lockhart_Martinelli_Xtt({x, rhol, rhog, mul, mug, pow_x=0.9, pow_rho=0.5,
                            pow_mu=0.1, n=null}) {
    if( n !== null ) {
        let pow_x = (2-n)/2.;
        let pow_mu = n/2.;
    }
    return ((1-x)/x)**pow_x * (rhog/rhol)**pow_rho * (mul/mug)**pow_mu;
}
export function Baroczy({x, rhol, rhog, mul, mug}) {
    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug, {
                                  pow_x: 0.74, pow_rho: 0.65, pow_mu: 0.13 });
    return (1 + Xtt)**-1;
}
export function Tandon_Varma_Gupta({x, rhol, rhog, mul, mug, m, D}) {
    let G = m/(Math.PI/4*D**2);
    let Rel = G*D/mul;
    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug);
    let Fxtt = 0.15*(Xtt**-1 + 2.85*Xtt**-0.476);
    if( Rel < 1125 ) { let alpha = 1 - 1.928*Rel**-0.315/Fxtt + 0.9293*Rel**-0.63/Fxtt**2; }
    else { let alpha = 1 - 0.38*Rel**-0.088/Fxtt + 0.0361*Rel**-0.176/Fxtt**2; }
    return alpha;
}
export function Harms({x, rhol, rhog, mul, mug, m, D}) {
    let G = m/(Math.PI/4*D**2);
    let Rel = G*D*(1-x)/mul;
    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug);
    return (1 - 10.06*Rel**-0.875*(1.74 + 0.104*Math.sqrt(Rel))**2
            *1.0/Math.sqrt(1.376 + 7.242/Xtt**1.655));
}
export function Domanski_Didion({x, rhol, rhog, mul, mug}) {
    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug);
    if( Xtt < 10 ) { return (1 + Xtt**0.8)**-0.378; }
    else { return 0.823 - 0.157*Math.log(Xtt); }
}
export function Graham({x, rhol, rhog, mul, mug, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let Ft = Math.sqrt(G**2*x**3/((1-x)*rhog**2*g*D));
    if( Ft < 0.01032 ) { return 0; }
    else { return 1 - Math.exp(-1 - 0.3*Math.log(Ft) - 0.0328*Math.log(Ft)**2); }
}
export function Yashar({x, rhol, rhog, mul, mug, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let Ft = Math.sqrt(G**2*x**3/((1-x)*rhog**2*g*D));
    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug);
    return (1 + 1./Ft + Xtt)**-0.321;
}
export function Huq_Loth({x, rhol, rhog}) {
    let B = 2*x*(1-x);
    let D = Math.sqrt(1 + 2*B*(rhol/rhog -1));
    return 1 - 2*(1-x)**2/(1 - 2*x + D);
}
export function Kopte_Newell_Chato({x, rhol, rhog, mul, mug, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let Ft = Math.sqrt(G**2*x**3/((1-x)*rhog**2*g*D));
    if( Ft < 0.044 ) { return homogeneous(x, rhol, rhog); }
    else { return 1.045 - Math.exp(-1 - 0.342*Math.log(Ft) - 0.0268*Math.log(Ft)**2 + 0.00597*Math.log(Ft)**3); }
////// Drift flux models
}
export function Steiner({x, rhol, rhog, sigma, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let C0 = 1 + 0.12*(1-x);
    let vgm = 1.18*(1-x)/Math.sqrt(rhol)*Math.sqrt(Math.sqrt(g*sigma*(rhol-rhog)));
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
export function Rouhani_1({x, rhol, rhog, sigma, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let C0 = 1 + 0.2*(1-x);
    let vgm = 1.18*(1-x)/Math.sqrt(rhol)*Math.sqrt(Math.sqrt(g*sigma*(rhol-rhog)));
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
export function Rouhani_2({x, rhol, rhog, sigma, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let C0 = 1 + 0.2*(1-x)*Math.sqrt(Math.sqrt(g*D))*Math.sqrt(rhol/G);
    let vgm = 1.18*(1-x)/Math.sqrt(rhol)*Math.sqrt(Math.sqrt(g*sigma*(rhol-rhog)));
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
export function Nicklin_Wilkes_Davidson({x, rhol, rhog, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let C0 = 1.2;
    let vgm = 0.35*Math.sqrt(g*D);
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
export function Gregory_Scott({x, rhol, rhog}) {
    let C0 = 1.19;
    return x/rhog*(C0*(x/rhog + (1-x)/rhol))**-1;
}
export function Dix({x, rhol, rhog, sigma, m, D, g=g}) {
    let vgs = m*x/(rhog*Math.PI/4*D**2);
    let vls = m*(1-x)/(rhol*Math.PI/4*D**2);
    let G = m/(Math.PI/4*D**2);
    let C0 = vgs/(vls+vgs)*(1 + (vls/vgs)**((rhog/rhol)**0.1));
    let vgm = 2.9*Math.sqrt(Math.sqrt(g*sigma*(rhol-rhog)/rhol**2));
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
export function Sun_Duffey_Peng({x, rhol, rhog, sigma, m, D, P, Pc, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let Pr = Pc !== null ? P/Pc : 0.5;
    let C0 = (0.82 + 0.18*Pr)**-1;
    let vgm = 1.41*Math.sqrt(Math.sqrt(g*sigma*(rhol-rhog)/rhol**2));
    return x/rhog*(C0*(x/rhog + (1-x)/rhol) + vgm/G)**-1;
}
// Correlations developed in reviews
export function Xu_Fang_voidage({x, rhol, rhog, m, D, g=g}) {
    let G = m/(Math.PI/4*D**2);
    let alpha_h = homogeneous(x, rhol, rhog);
    let Frlo = G**2/(g*D*rhol**2);
    return (1 + (1 + 2*Frlo**-0.2*alpha_h**3.5)*((1-x)/x)*(rhog/rhol))**-1;
}
export function Woldesemayat_Ghajar({x, rhol, rhog, sigma, m, D, P, angle=0, g=g}) {
    let vgs = m*x/(rhog*Math.PI/4*D**2);
    let vls = m*(1-x)/(rhol*Math.PI/4*D**2);
    let first = vgs*(1 + (vls/vgs)**((rhog/rhol)**0.1));
    let second = 2.9*Math.sqrt(Math.sqrt((g*D*sigma*(1 + Math.cos(radians(angle)))*(rhol-rhog))/rhol**2));
    if( P === null ) { let P = 101325.0; }
    let third = (1.22 + 1.22*Math.sin(radians(angle)))**(101325./P);
    return vgs/(first + second*third);
}
// x, rhol, rhog 2ill be the minimum inputs
export let two_phase_voidage_correlations = {'Thom' : (Thom, ('x', 'rhol', 'rhog', 'mul', 'mug')),
  'Zivi' : (Zivi, ('x', 'rhol', 'rhog')),
  'Smith' : (Smith, ('x', 'rhol', 'rhog')),
  'Fauske' : (Fauske, ('x', 'rhol', 'rhog')),
  'Chisholm_voidage' : (Chisholm_voidage, ('x', 'rhol', 'rhog')),
  'Turner Wallis' : (Turner_Wallis, ('x', 'rhol', 'rhog', 'mul', 'mug')),
  'homogeneous' : (homogeneous, ('x', 'rhol', 'rhog')),
  'Chisholm Armand' : (Chisholm_Armand, ('x', 'rhol', 'rhog')),
  'Armand' : (Armand, ('x', 'rhol', 'rhog')),
  'Nishino Yamazaki' : (Nishino_Yamazaki, ('x', 'rhol', 'rhog')),
  'Guzhov' : (Guzhov, ('x', 'rhol', 'rhog', 'm', 'D')),
  'Kawahara' : (Kawahara, ('x', 'rhol', 'rhog', 'D')),
  'Baroczy' : (Baroczy, ('x', 'rhol', 'rhog', 'mul', 'mug')),
  'Tandon Varma Gupta' : (Tandon_Varma_Gupta, ('x', 'rhol', 'rhog', 'mul', 'mug', 'm', 'D')),
  'Harms' : (Harms, ('x', 'rhol', 'rhog', 'mul', 'mug', 'm', 'D')),
  'Domanski Didion' : (Domanski_Didion, ('x', 'rhol', 'rhog', 'mul', 'mug')),
  'Graham' : (Graham, ('x', 'rhol', 'rhog', 'mul', 'mug', 'm', 'D', 'g')),
  'Yashar' : (Yashar, ('x', 'rhol', 'rhog', 'mul', 'mug', 'm', 'D', 'g')),
  'Huq_Loth' : (Huq_Loth, ('x', 'rhol', 'rhog')),
  'Kopte_Newell_Chato' : (Kopte_Newell_Chato, ('x', 'rhol', 'rhog', 'mul', 'mug', 'm', 'D', 'g')),
  'Steiner' : (Steiner, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'g')),
  'Rouhani 1' : (Rouhani_1, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'g')),
  'Rouhani 2' : (Rouhani_2, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'g')),
  'Nicklin Wilkes Davidson' : (Nicklin_Wilkes_Davidson, ('x', 'rhol', 'rhog', 'm', 'D', 'g')),
  'Gregory_Scott' : (Gregory_Scott, ('x', 'rhol', 'rhog')),
  'Dix' : (Dix, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'g')),
  'Sun Duffey Peng' : (Sun_Duffey_Peng, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'P', 'Pc', 'g')),
  'Xu Fang voidage' : (Xu_Fang_voidage, ('x', 'rhol', 'rhog', 'm', 'D', 'g')),
  'Woldesemayat Ghajar' : (Woldesemayat_Ghajar, ('x', 'rhol', 'rhog', 'sigma', 'm', 'D', 'P', 'angle', 'g'))};
let _unknown_two_phase_voidage_corr = 'Method not recognized; available methods are %s %list(two_phase_voidage_correlations.keys())';
export function liquid_gas_voidage_methods({x, rhol, rhog, D=null, m=null, mul=null, mug=null,
                               sigma=null, P=null, Pc=null, angle=0.0, g=g,
                               check_ranges=false}) {
    let vals = {'x': x, 'rhol': rhol, 'rhog': rhog, 'D': D, 'm': m, 'mul': mul, 'mug': mug, 'sigma': sigma, 'P': P, 'Pc': Pc, 'angle': angle, 'g': g, 'check_ranges': check_ranges};
    let usable_methods = [];
    for( let [ method, value ] of two_phase_voidage_correlations.items() ) {
        let [f, args] = value;
        if( args.map((i) => vals[i] !== null).every((i) => i) ) { usable_methods.push(method); }
    }
    return usable_methods;
}
export function liquid_gas_voidage({x, rhol, rhog, D=null, m=null, mul=null, mug=null,
                       sigma=null, P=null, Pc=null, angle=0, g=g, Method=null}) {
    if( Method === null ) { let Method2 = 'homogeneous'; }
    else { Method2 = Method; }
    
    if( Method2 === "Thom" ) { return Thom( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug }); }
    else if( Method2 === "Zivi" ) { return Zivi( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Smith" ) { return Smith( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Fauske" ) { return Fauske( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Chisholm_voidage" ) { return Chisholm_voidage( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Turner Wallis" ) { return Turner_Wallis( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug }); }
    else if( Method2 === "homogeneous" ) { return homogeneous( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Chisholm Armand" ) { return Chisholm_Armand( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Armand" ) { return Armand( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Nishino Yamazaki" ) { return Nishino_Yamazaki( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Guzhov" ) { return Guzhov( {x: x, rhol: rhol, rhog: rhog, m: m, D: D }); }
    else if( Method2 === "Kawahara" ) { return Kawahara( {x: x, rhol: rhol, rhog: rhog, D: D }); }
    else if( Method2 === "Baroczy" ) { return Baroczy( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug }); }
    else if( Method2 === "Tandon Varma Gupta" ) { return Tandon_Varma_Gupta( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, m: m, D: D }); }
    else if( Method2 === "Harms" ) { return Harms( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, m: m, D: D }); }
    else if( Method2 === "Domanski Didion" ) { return Domanski_Didion( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug }); }
    else if( Method2 === "Graham" ) { return Graham( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, m: m, D: D, g: g }); }
    else if( Method2 === "Yashar" ) { return Yashar( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, m: m, D: D, g: g }); }
    else if( Method2 === "Huq_Loth" ) { return Huq_Loth( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Kopte_Newell_Chato" ) { return Kopte_Newell_Chato( {x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, m: m, D: D, g: g }); }
    else if( Method2 === "Steiner" ) { return Steiner( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, g: g }); }
    else if( Method2 === "Rouhani 1" ) { return Rouhani_1( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, g: g }); }
    else if( Method2 === "Rouhani 2" ) { return Rouhani_2( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, g: g }); }
    else if( Method2 === "Nicklin Wilkes Davidson" ) { return Nicklin_Wilkes_Davidson( {x: x, rhol: rhol, rhog: rhog, m: m, D: D, g: g }); }
    else if( Method2 === "Gregory_Scott" ) { return Gregory_Scott( {x: x, rhol: rhol, rhog: rhog }); }
    else if( Method2 === "Dix" ) { return Dix( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, g: g }); }
    else if( Method2 === "Sun Duffey Peng" ) { return Sun_Duffey_Peng( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, P: P, Pc: Pc, g: g }); }
    else if( Method2 === "Xu Fang voidage" ) { return Xu_Fang_voidage( {x: x, rhol: rhol, rhog: rhog, m: m, D: D, g: g }); }
    else if( Method2 === "Woldesemayat Ghajar" ) { return Woldesemayat_Ghajar( {x: x, rhol: rhol, rhog: rhog, sigma: sigma, m: m, D: D, P: P, angle: angle, g: g }); }
    else { throw new Error( 'ValueError',_unknown_two_phase_voidage_corr ); }
}
export function density_two_phase({alpha, rhol, rhog}) { return alpha*rhog + (1. - alpha)*rhol; }
export function two_phase_voidage_experimental({rho_lg, rhol, rhog}) { return (rho_lg - rhol)/(rhog - rhol); }
////// two-phase viscosity models
export function Beattie_Whalley({x, mul, mug, rhol, rhog}) {
    let alpha = homogeneous(x, rhol, rhog);
    return mul*(1. - alpha)*(1. + 2.5*alpha) + mug*alpha;
}
export function McAdams({x, mul, mug}) { return 1./(x/mug + (1. - x)/mul); }
export function Cicchitti({x, mul, mug}) { return x*mug + (1. - x)*mul; }
export function Lin_Kwok({x, mul, mug}) { return mul*mug/(mug + x**1.4*(mul - mug)); }
export function Fourar_Bories({x, mul, mug, rhol, rhog}) {
    let rhom = 1./(x/rhog + (1. - x)/rhol);
    let nul = mul/rhol; // = nu_mu_converter(rho=rhol, mu=mul)
    let nug = mug/rhog; // = nu_mu_converter(rho=rhog, mu=mug)
    return rhom*(Math.sqrt(x*nug) + Math.sqrt((1. - x)*nul))**2;
}
export function Duckler({x, mul, mug, rhol, rhog}) { return (x*mug/rhog + (1. - x)*mul/rhol)/(x/rhog + (1. - x)/rhol); }
export let liquid_gas_viscosity_correlations = {'Beattie Whalley': (Beattie_Whalley, 1),
                                         'Fourar Bories': (Fourar_Bories, 1),
                                         'Duckler': (Duckler, 1),
                                         'McAdams': (McAdams, 0),
                                         'Cicchitti': (Cicchitti, 0),
                                         'Lin Kwok': (Lin_Kwok, 0)};
export let liquid_gas_viscosity_correlations_list = ['Beattie Whalley', 'Fourar Bories', 'Duckler', 'McAdams', 'Cicchitti', 'Lin Kwok'];
export function gas_liquid_viscosity_methods({rhol=null, rhog=null, check_ranges=false}) {
    let methods = ['McAdams', 'Cicchitti', 'Lin Kwok'];
    if( rhol !== null && rhog !== null ) { methods = liquid_gas_viscosity_correlations_list; }
    return methods;
}
let _gas_liquid_viscosity_method_unknown = 'Method not recognized; available methods are %s %list(liquid_gas_viscosity_correlations.keys())';
export function gas_liquid_viscosity({x, mul, mug, rhol=null, rhog=null, Method=null}) {
    if( Method === null ) { Method = 'McAdams'; }
    if( Method === 'Beattie Whalley' ) { return Beattie_Whalley(x, mul, mug, { rhol: rhol, rhog: rhog }); }
    else if( Method === 'Fourar Bories' ) { return Fourar_Bories(x, mul, mug, { rhol: rhol, rhog: rhog }); }
    else if( Method === 'Duckler' ) { return Duckler(x, mul, mug, { rhol: rhol, rhog: rhog }); }
    else if( Method === 'McAdams' ) { return McAdams(x, mul, mug); }
    else if( Method === 'Cicchitti' ) { return Cicchitti(x, mul, mug); }
    else if( Method === 'Lin Kwok' ) { return Lin_Kwok(x, mul, mug); }
    else { throw new Error( 'ValueError',_gas_liquid_viscosity_method_unknown ); }
}
