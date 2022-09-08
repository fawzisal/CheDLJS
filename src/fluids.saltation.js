import { g, pi } from './fluids.constants.js';
let __all__ = ['Rizk', 'Matsumoto_1974', 'Matsumoto_1975', 'Matsumoto_1977', 'Schade', 'Weber_saltation', 'Geldart_Ling'];
export function Rizk({mp, dp, rhog, D}) {
    let alpha = 1440.0*dp + 1.96;
    let beta = 1100.0*dp + 2.5;
    let term1 = 0.1**alpha;
    let Frs_sorta = 1.0/Math.sqrt(g*D);
    let expression1 = term1*Frs_sorta**beta;
    let expression2 = mp/rhog/(pi/4*D*D);
    return (expression2/expression1)**(1./(1. + beta));
}
export function Matsumoto_1974({mp, rhop, dp, rhog, D, Vterminal=1}) {
    let A = pi/4*D**2;
    let Frp = Vterminal/Math.sqrt(g*dp);
    let Frs_sorta = 1./Math.sqrt(g*D);
    let expression1 = 0.448*Math.sqrt(rhop/rhog)*(Frp/10.)**-1.75*(Frs_sorta/10.)**3;
    let expression2 = mp/rhog/A;
    return (expression2/expression1)**(1/4.);
}
export function Matsumoto_1975({mp, rhop, dp, rhog, D, Vterminal=1}) {
    let A = pi/4*D**2;
    let Frp = Vterminal/Math.sqrt(g*dp);
    let Frs_sorta = 1./Math.sqrt(g*D);
    let expression1 = 1.11*(rhop/rhog)**0.55*(Frp/10.)**-2.3*(Frs_sorta/10.)**3;
    let expression2 = mp/rhog/A;
    return (expression2/expression1)**(1/4.);
}
export function Matsumoto_1977({mp, rhop, dp, rhog, D, Vterminal=1}) {
    let limit = 1.39*D*(rhop/rhog)**-0.74;
    let A = pi/4*D**2;
    let Frp, Frs_sorta, expression1, expression2;
    if( limit < dp ) {
        // Coarse routine
        Frp = Vterminal/Math.sqrt(g*dp);
        Frs_sorta = 1./Math.sqrt(g*D);
        expression1 = 0.373*(rhop/rhog)**1.06*(Frp/10.)**-3.7*(Frs_sorta/10.)**3.61;
        expression2 = mp/rhog/A;
        return (expression2/expression1)**(1/4.61);
    } else {
        Frs_sorta = 1./Math.sqrt(g*D);
        expression1 = 5560*(dp/D)**1.43*(Frs_sorta/10.)**4;
        expression2 = mp/rhog/A;
        return (expression2/expression1)**(0.2);
    }
}
export function Schade({mp, rhop, dp, rhog, D}) {
    let B = (D/dp)**0.025*(rhop/rhog)**0.34;
    let A = Math.sqrt(g*D);
    let C = mp/(rhog*pi/4*D**2);
    return (C**0.11*B*A)**(1/1.11);
}
export function Weber_saltation({mp, rhop, dp, rhog, D, Vterminal=4}) {
    let term1;
    if( Vterminal <= 3 ) {
        term1 = (7 + 8/3.*Vterminal)*(dp/D)**0.1;
    } else {
        term1 = 15.*(dp/D)**0.1;
    }
    let term2 = 1./Math.sqrt(g*D);
    let term3 = mp/rhog/(pi/4*D**2);
    return (term1/term2*Math.sqrt(Math.sqrt(term3)))**(1/1.25);
}
export function Geldart_Ling({mp, rhog, D, mug}) {
    let Gs = mp/(0.25*pi*D*D);
    if( Gs/D <= 47000.0 ) {
        return 1.5*Gs**0.465*D**-0.01*mug**0.055*rhog**-0.42;
    } else {
        return 8.7*Gs**0.302*D**0.153*mug**0.055*rhog**-0.42;
    }
}
