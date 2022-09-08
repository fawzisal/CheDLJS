import { g, pi } from './fluids.constants.js' ;
import { secant, newton_system, solve_2_direct } from  './fluids.numerics_init.js' ;
let __all__ = ['voidage_experimental', 'specific_area_mesh', 'Stichlmanir_dry', 'Stichlmair_wet', 'Stichlmair_flood', 'Robbins', 'dP_demister_dry_Setekleiv_Svendsen_lit', 'dP_demister_dry_Setekleiv_Svendsen', 'dP_demister_wet_ElDessouky', 'separation_demister_ElDessouky'];
export function dP_demister_dry_Setekleiv_Svendsen({S, voidage, vs, rho, mu, L=1.0}) {
    let term = 10.29 - 565./(69.6*S*L - (S*L)**2 - 779) - 74.9/(160.9 - 4.85*S*L);
    let right = term + 45.33*(mu*voidage*S**2*L/rho/vs)**0.75;
    return right*rho*vs**2/voidage**2;
}
export function dP_demister_dry_Setekleiv_Svendsen_lit({S, voidage, vs, rho, mu, L=1.0}) {
    let term = 7.3 - 320./(69.6*S*L - (S*L)**2 - 779) - 52.4/(161 - 4.85*S*L);
    let right = term + 27.2*(mu*voidage*S**2*L/rho/vs)**0.75;
    return right*rho*vs**2/voidage**2;
}
export function dP_demister_wet_ElDessouky({vs, voidage, d_wire, L=1.0}) {
    return L*0.002356999643727531*(1-voidage)**0.375798*vs**0.81317*d_wire**-1.56114147;
}
export function separation_demister_ElDessouky({vs, voidage, d_wire, d_drop}) {
    let eta = 0.858352355761947*d_wire**-0.28264*(1-voidage)**0.099625*vs**0.106878*d_drop**0.383197;
    return Math.min(eta, 1.0);
}
export function voidage_experimental({m, rho, D, H}) {
    return 1 - m/(pi/4*D**2*H)/rho;
}
export function specific_area_mesh({voidage, d}) {
    return 4*(1-voidage)/d;
}
////// Packing
export function Stichlmair_dry({Vg, rhog, mug, voidage, specific_area, C1, C2, C3, H=1.}) {
    let dp = 6*(1-voidage)/specific_area;
    let Re = Vg*rhog*dp/mug;
    let f0 = C1/Re + C2/Math.sqrt(Re) + C3;
    return 3/4.*f0*(1-voidage)/voidage**4.65*rhog*H/dp*Vg**2;
}
export function _Stichlmair_wet_err({dP_irr, h0, c1, dP_dry, H, voidage, c}) {
    let hT = h0*(1.0 + 20.0*dP_irr*dP_irr*c1);
    let err = dP_dry/H*((1-voidage+hT)/(1.0 - voidage))**((2.0 + c)/3.)*(voidage/(voidage-hT))**4.65 -dP_irr/H;
    return err;
}
export function Stichlmair_wet({Vg, Vl, rhog, rhol, mug, voidage, specific_area, C1, C2, C3, H=1.0}) {
    let dp = 6.0*(1.0 - voidage)/specific_area;
    let Re = Vg*rhog*dp/mug;
    let f0 = C1/Re + C2/Math.sqrt(Re) + C3;
    let dP_dry = 3/4.*f0*(1-voidage)/voidage**4.65*rhog*H/dp*Vg*Vg;
    let c = (-C1/Re - C2/(2*Math.sqrt(Re)))/f0;
    let Frl = Vl**2*specific_area/(g*voidage**4.65);
    let h0 = 0.555*Frl**(1/3.);
    let c1 = 1.0/(H*rhol*g);
    c1 *= c1;
    return secant(_Stichlmair_wet_err, dP_dry, { args: [h0, c1, dP_dry, H, voidage, c] });
}
export function _Stichlmair_flood_f({inputs, Vl, rhog, rhol, mug, voidage, specific_area,
                        C1, C2, C3, H}) {
    /*Internal function which calculates the errors of the two Stichlmair
    objective functions, and their jacobian.*/
    let [Vg, dP_irr] = [float(inputs[0]), float(inputs[1])];
    let dp = 6.0*(1.0 - voidage)/specific_area;
    let Re = Vg*rhog*dp/mug;
    let f0 = C1/Re + C2/Math.sqrt(Re) + C3;
    let dP_dry = 0.75*f0*(1.0 - voidage)/voidage**4.65*rhog*H/dp*Vg*Vg;
    let c = (-C1/Re - 0.5*C2*1.0/Math.sqrt(Re))/f0;
    let Frl = Vl*Vl*specific_area/(g*voidage**4.65);
    let h0 = 0.555*Frl**(1/3.);
    let hT = h0*(1.0 + 20.0*(dP_irr/H/rhol/g)**2);
    let err1 = dP_dry/H*((1.0 - voidage + hT)/(1.0 - voidage))**((2.0 + c)/3.)*(voidage/(voidage-hT))**4.65 - dP_irr/H;
    let term = (dP_irr/(rhol*g*H))**2;
    let err2 = (1./term - 40.0*((2.0+c)/3.)*h0/(1.0 - voidage + h0*(1.0 + 20.0*term))
    - 186.0*h0/(voidage - h0*(1.0 + 20.0*term)));
    return err1, err2;
}
export function _Stichlmair_flood_f_and_jac({inputs, Vl, rhog, rhol, mug, voidage,
                                specific_area, C1, C2, C3, H}) {
    /*Internal function which calculates the errors of the two Stichlmair
    objective functions, and their jacobian.
    Derived using SymPy on the main flooding function.
    */
    let [Vg, dP_irr] = [inputs[0], inputs[1]];
    let x0 = 1.0/H;
    let x1 = Vg*Vg;
    let x2 = voidage**(-4.65);
    let x3 = specific_area*x2;
    let x4 = Vl*Vl*x3/g;
    let x5 = x4**0.333333333333333;
    let x6 = dP_irr*dP_irr;
    let x7 = H*H;
    let x8 = 1.0/x7;
    let x9 = g*g;
    let x10 = 1.0/x9;
    let x11 = rhol*rhol;
    let x12 = 1.0/x11;
    let x13 = x5*(20.0*x10*x12*x6*x8 + 1.0);
    let x14 = 0.555*x13;
    let x15 = (voidage/(voidage - x14))**4.65;
    let x16 = 1.0/Vg;
    let x17 = 1.0/rhog;
    let x18 = voidage - 1.0;
    let x19 = 1.0/x18;
    let x20 = C1*mug*specific_area*x16*x17*x19;
    let x21 = 2.44948974278318*C2;
    let x22 = Vg*rhog/(mug*specific_area);
    let x23 = x21*1.0/Math.sqrt(-x18*x22);
    let x24 = 6.0*C3 - x20 + x23;
    let x25 = 1.0 - voidage;
    let x26 = x14 + x25;
    let x27 = -x19*x26;
    let x28 = 2.0*C1*mug*specific_area*x16*x17/x25 + x21*1.0/Math.sqrt(x22*x25);
    let x29 = 1.0/x24;
    let x30 = x28*x29;
    let x31 = x27**(-0.166666666666667*x30 + 0.666666666666667);
    let x32 = x11*x7*x9;
    let x33 = 200.0*voidage;
    let x34 = 111.0*x13;
    let x35 = x33 - x34;
    let x36 = 1.0/x35;
    let x37 = -x33 + x34 + 200.0;
    let x38 = 1.0/x37;
    let x39 = 2.0*x20;
    let x40 = -4.0*x20 + x23 + x29*(-x23 + x39)*(x23 - x39);
    let x41 = dP_irr*rhog*specific_area*x0*x1*x10*x12*x15*x2*x24*x31;
    let x42 = dP_irr*x10*x12*x4**0.666666666666667*x8;
    let [F1, F2, dF1_dVg, dF2_dVg, dF1_dP_irr, dF2_dP_irr] = [
            -dP_irr*x0 + 0.0208333333333333*rhog*specific_area*x1*x15*x2*x24*x31,
             x32/x6 - 20646.0*x36*x5 - x38*x5*(2960.0 - 740.0*x28*x29),
             0.00173611111111111*Vg*rhog*x15*x3*x31*(144.0*C3 - 12.0*x20 + 18.0*x23 + x40*Math.log(x27)),
             x0*(430.125*x36*x41*x5 - 15.4166666666667*x38*x41*x5*(x30 - 4.0) - 1.0),
             -1.85*x16*x29*x40*x5/x26,
             3285600.0*x42*(-x30 + 4.0)*x38*x38- 91668240.0*x42*x36*x36 - 2.0*x32/(dP_irr*x6)];
    let err = [0.0]*2;
    err[0] = F1;
    err[1] = F2;
    let jac = [[dF1_dVg, dF2_dVg], [dF1_dP_irr, dF2_dP_irr]];// numba: delete
    return err, jac;
}
export function Stichlmair_flood({Vl, rhog, rhol, mug, voidage, specific_area, C1, C2, C3,
                     H=1.0}) {
    let guess = [0.0]*2;
    guess[0] = Vl*100.0;
    guess[1] = 1000.0;
    return newton_system(_Stichlmair_flood_f_and_jac, { x0: guess, jac: true,
                         args: [Vl, rhog, rhol, mug, voidage, specific_area, C1,
                         C2, C3, H], ytol: 1e-11, solve_func: solve_2_direct })[0][0];
}
export function Robbins({L, G, rhol, rhog, mul, H=1.0, Fpd=24.0}) {
    // Convert SI units to imperial for use in correlation
    L = L*737.33812; // kg/s/m^2 to lb/hr/ft^2
    G = G*737.33812; // kg/s/m^2 to lb/hr/ft^2
    rhol = rhol*0.062427961; // kg/m^3 to lb/ft^3
    rhog = rhog*0.062427961; // kg/m^3 to lb/ft^3
    mul = mul*1000.0; // Pa*s to cP
    let C3 = 7.4E-8;
    let C4 = 2.7E-5;
    let Fpd_root_term = Math.sqrt(.05*Fpd);
    let Lf = L*(62.4/rhol)*Fpd_root_term*mul**0.1;
    let Gf = G*Math.sqrt(0.075/rhog)*Fpd_root_term;
    let Gf2 = Gf*Gf;
    let C4LF_10_GF2_C3 = C3*Gf2*10.0**(C4*Lf);
    let C4LF_10_GF2_C3_2 = C4LF_10_GF2_C3*C4LF_10_GF2_C3;
    let dP = C4LF_10_GF2_C3 + 0.4*(5e-5*Lf)**0.1*(C4LF_10_GF2_C3_2*C4LF_10_GF2_C3_2);
    return dP*817.22083*H; // in. H2O to Pa/m
}
