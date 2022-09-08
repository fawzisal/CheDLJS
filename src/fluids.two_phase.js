let __all__ = ['two_phase_dP', 'two_phase_dP_methods', 'two_phase_dP_acceleration', 'two_phase_dP_dz_acceleration', 'two_phase_dP_gravitational', 'two_phase_dP_dz_gravitational', 'Beggs_Brill', 'Lockhart_Martinelli', 'Friedel', 'Chisholm', 'Kim_Mudawar', 'Baroczy_Chisholm', 'Theissing', 'Muller_Steinhagen_Heck', 'Gronnerud', 'Lombardi_Pedrocchi', 'Jung_Radermacher', 'Tran', 'Chen_Friedel', 'Zhang_Webb', 'Xu_Fang', 'Yu_France', 'Wang_Chiang_Lu', 'Hwang_Kim', 'Zhang_Hibiki_Mishima', 'Mishima_Hibiki', 'Bankoff', 'Mandhane_Gregory_Aziz_regime', 'Taitel_Dukler_regime'];
import { radians } from './fluids.helpers.js';
import { g, deg2rad } from './fluids.constants.js';
import { splev, implementation_optimize_tck } from './fluids.numerics_init.js';
import { friction_factor } from './fluids.friction.js';
import { Reynolds, Froude, Weber, Confinement, Bond, Suratman } from './fluids.core.js';
import { homogeneous, Lockhart_Martinelli_Xtt } from './fluids.two_phase_voidage.js';


export let Beggs_Brill_dat = {'segregated': [0.98, 0.4846, 0.0868], 'intermittent': [0.845, 0.5351, 0.0173], 'distributed': [1.065, 0.5824, 0.0609]};
export function _Beggs_Brill_holdup({regime, lambda_L, Fr, angle, LV}) {
    if( regime === 0 ) {
        let [a, b, c] = [0.98, 0.4846, 0.0868];
    } else if( regime === 2 ) {
        let [a, b, c] = [0.845, 0.5351, 0.0173];
    } else if( regime === 3 ) {
        let [a, b, c] = [1.065, 0.5824, 0.0609];
}
    let HL0 = a*lambda_L**b*Fr**-c;
    if( HL0 < lambda_L ) {
        HL0 = lambda_L;
    }
    if( angle > 0.0 ) { // uphill
        // h used instead of g to avoid conflict with gravitational constant
        if( regime === 0 ) {
            let [d, e, f, h] = [0.011, -3.768, 3.539, -1.614];
        } else if( regime === 2 ) {
            let [d, e, f, h] = [2.96, 0.305, -0.4473, 0.0978];
    } else if( regime === 3 ) {
            // Dummy values for distributed - > psi = 1.
            let [d, e, f, h] = [2.96, 0.305, -0.4473, 0.0978];
    }
    } else if( angle <= 0 ) { // downhill
        let [d, e, f, h] = [4.70, -0.3692, 0.1244, -0.5056];
    }

    let C = (1.0 - lambda_L)*Math.log(d*lambda_L**e*LV**f*Fr**h);
    if( C < 0.0 ) {
        C = 0.0;
    }
    let Psi = 1.0 + C*(Math.sin(1.8*angle) - 1.0/3.0*Math.sin(1.8*angle)**3);
    if( (angle > 0 && regime === 3) || angle === 0 ) {
        Psi = 1.0;
    }
    let Hl = HL0*Psi;
    return Hl;
}

export function Beggs_Brill({m, x, rhol, rhog, mul, mug, sigma, P, D, angle, roughness=0.0,
                L=1.0, g=g, acceleration=true}) {
    // 0 - segregated; 1 - transition; 2 - intermittent; 3 - distributed
    let qg = x*m/rhog;
    let ql = (1.0 - x)*m/rhol;

    let A = 0.25*Math.PI*D*D;
    let Vsg = qg/A;
    let Vsl = ql/A;
    let Vm = Vsg + Vsl;
    let Fr = Vm*Vm/(g*D);
    let lambda_L = Vsl/Vm; // no slip liquid holdup

    let L1 = 316.0*lambda_L**0.302;
    let L2 = 0.0009252*lambda_L**-2.4684;
    let L3 = 0.1*lambda_L**-1.4516;
    let L4 = 0.5*lambda_L**-6.738;
    if( (lambda_L < 0.01 && Fr < L1) || (lambda_L >= 0.01 && Fr < L2) ) {
        let regime = 0;
    } else if( (lambda_L >= 0.01 && L2 <= Fr <= L3) ) {
        regime = 1;
    } else if( (0.01 <= lambda_L < 0.4 && L3 < Fr <= L1) || (lambda_L >= 0.4 && L3 < Fr <= L4) ) {
        regime = 2;
    } else if( (lambda_L < 0.4 && Fr >= L1) || (lambda_L >= 0.4 && Fr > L4) ) {
        regime = 3;
    } else {
        throw new Error( 'ValueError','Outside regime ranges' );
    }

    let LV = Vsl*Math.sqrt(Math.sqrt(rhol/(g*sigma)));
    if( angle === null ) {
        angle = 0.0;
    }
    angle = deg2rad*angle;

    if( regime !== 1 ) {
        let Hl = _Beggs_Brill_holdup(regime, lambda_L, Fr, angle, LV);
    } else {
        A = (L3 - Fr)/(L3 - L2);
        Hl = (A*_Beggs_Brill_holdup(0, lambda_L, Fr, angle, LV)
             + (1.0 - A)*_Beggs_Brill_holdup(2, lambda_L, Fr, angle, LV));
    }

    let rhos = rhol*Hl + rhog*(1.0 - Hl);
    let mum = mul*lambda_L +  mug*(1.0 - lambda_L);
    let rhom = rhol*lambda_L +  rhog*(1.0 - lambda_L);
    let Rem = rhom*D/mum*Vm;
    let fn = friction_factor( {Re: Rem, eD: roughness/D });
    x = lambda_L/(Hl*Hl);


    if( 1.0 < x < 1.2 ) {
        let S = Math.log(2.2*x - 1.2);
    } else {
        let logx = Math.log(x);
        // from horner(-0.0523 + 3.182*Math.log(x) - 0.8725*Math.log(x)**2 + 0.01853*Math.log(x)**4, x)
        let S = logx/(logx*(logx*(0.01853*logx*logx - 0.8725) + 3.182) - 0.0523);
    }
    if( S > 7.0 ) {
        S = 7.0;  // Truncate S to avoid Math.exp(S) overflowing
    }
    let ftp = fn*Math.exp(S);
    let dP_ele = g*Math.sin(angle)*rhos*L;
    let dP_fric = ftp*L/D*0.5*rhom*Vm*Vm;
    // rhos here is pretty clearly rhos according to Shoham
    if( P === null ) {
        let P = 101325.0;
    }
    if( !acceleration ) {
        let dP = dP_ele + dP_fric;
    } else {
        let Ek = Vsg*Vm*rhos/P;  // Confirmed this expression is dimensionless
        dP = (dP_ele + dP_fric)/(1.0 - Ek);
    }
    return dP;
}


export function Friedel({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of E, dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of E
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });

    let F = x**0.78*(1-x)**0.224;
    let H = (rhol/rhog)**0.91*(mug/mul)**0.19*(1 - mug/mul)**0.7;
    let E = (1-x)**2 + x**2*(rhol*fd_go/(rhog*fd_lo));

    // Homogeneous properties, for Froude/Weber numbers
    let voidage_h = homogeneous(x, rhol, rhog);
    let rho_h = rhol*(1-voidage_h) + rhog*voidage_h;
    let Q_h = m/rho_h;
    let v_h = Q_h/(Math.PI/4*D**2);

    let Fr = Froude( {V: v_h, L: D, squared: true }); // checked with (m/(Math.PI/4*D**2))**2/g/D/rho_h**2
    let We = Weber( {V: v_h, L: D, rho: rho_h, sigma: sigma }); // checked with (m/(Math.PI/4*D**2))**2*D/sigma/rho_h

    let phi_lo2 = E + 3.24*F*H/(Fr**0.0454*We**0.035);
    return phi_lo2*dP_lo;
}


export function Gronnerud({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    let G = m/(Math.PI/4*D**2);
    let V = G/rhol;
    let Frl = Froude( {V: V, L: D, squared: true });
    if( Frl >= 1 ) {
        let f_Fr = 1;
    } else {
        f_Fr = Frl**0.3 + 0.0055*(Math.log(1./Frl))**2;
    }
    let dP_dL_Fr = f_Fr*(x + 4*(x**1.8 - x**10*Math.sqrt(f_Fr)));
    let phi_gd = 1 + dP_dL_Fr*((rhol/rhog)/Math.sqrt(Math.sqrt(mul/mug)) - 1);

    // Liquid-only properties, for calculation of E, dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);
    return phi_gd*dP_lo;
}


export function Chisholm({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0,
             rough_correction=false}) {
    let G_tp = m/(Math.PI/4*D**2);
    let n = 0.25; // Blasius friction factor exponent
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of dP_go
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    let Gamma = Math.sqrt(dP_go/dP_lo);
    if( Gamma <= 9.5 ) {
        if( G_tp <= 500 ) {
            let B = 4.8;
        } else if( G_tp < 1900 ) {
            B = 2400./G_tp;
    } else {
            B = 55.0/Math.sqrt(G_tp);
        }
    } else if( Gamma <= 28 ) {
        if( G_tp <= 600 ) {
            B = 520./Math.sqrt(G_tp)/Gamma;
        } else {
            B = 21./Gamma;
        }
    } else {
        B = 15000./Math.sqrt(G_tp)/Gamma**2;
    }

    if( rough_correction ) {
        n = Math.log(fd_lo/fd_go)/Math.log(Re_go/Re_lo);
        let B_ratio = (0.5*(1 + (mug/mul)**2 + 10**(-600*roughness/D)))**((0.25-n)/0.25);
        B = B*B_ratio;
    }
    let phi2_ch = 1 + (Gamma**2-1)*(B*x**((2-n)/2.)*(1-x)**((2-n)/2.) + x**(2-n));
    return phi2_ch*dP_lo;
}


export function Baroczy_Chisholm({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    let G_tp = m/(Math.PI/4*D**2);
    let n = 0.25; // Blasius friction factor exponent
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of dP_go
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    let Gamma = Math.sqrt(dP_go/dP_lo);
    if( Gamma <= 9.5 ) {
        let B = 55.0/Math.sqrt(G_tp);
    } else if( Gamma <= 28 ) {
        B = 520./Math.sqrt(G_tp)/Gamma;
    } else {
        B = 15000./Math.sqrt(G_tp)/Gamma**2;
    }
    let phi2_ch = 1 + (Gamma**2-1)*(B*x**((2-n)/2.)*(1-x)**((2-n)/2.) + x**(2-n));
    return phi2_ch*dP_lo;
}


export function Muller_Steinhagen_Heck({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of dP_go
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    let G_MSH = dP_lo + 2*(dP_go - dP_lo)*x;
    return G_MSH*(1-x)**(1/3.) + dP_go*x**3;
}


export function Lombardi_Pedrocchi({m, x, rhol, rhog, sigma, D, L=1.0}) {
    let voidage_h = homogeneous(x, rhol, rhog);
    let rho_h = rhol*(1-voidage_h) + rhog*voidage_h;
    let G_tp = m/(Math.PI/4*D**2);
    return 0.83*G_tp**1.4*sigma**0.4*L/(D**1.2*rho_h**0.866);
}


export function Theissing({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    // Liquid-only flow
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only flow
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    // Handle x = 0, x=1:
    if( x === 0 ) {
        return dP_lo;
    } else if( x === 1 ) {
        return dP_go;
}

    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor( {Re: Re_g, eD: roughness/D });
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    // The model
    let n1 = Math.log(dP_l/dP_lo)/Math.log(1.-x);
    let n2 = Math.log(dP_g/dP_go)/Math.log(x);
    let n = (n1 + n2*(dP_g/dP_l)**0.1)/(1 + (dP_g/dP_l)**0.1);
    let epsilon = 3 - 2*(2*Math.sqrt(rhol/rhog)/(1.+rhol/rhog))**(0.7/n);
    let dP = (dP_lo**(1./(n*epsilon))*(1-x)**(1./epsilon)
          + dP_go**(1./(n*epsilon))*x**(1./epsilon))**(n*epsilon);
    return dP;
}


export function Jung_Radermacher({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    let Xtt = Lockhart_Martinelli_Xtt(x, rhol, rhog, mul, mug);
    let phi_tp2 = 12.82*Xtt**-1.47*(1.-x)**1.8;
    return phi_tp2*dP_lo;
}


export function Tran({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of dP_go
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    let Gamma2 = dP_go/dP_lo;
    let Co = Confinement( {D: D, rhol: rhol, rhog: rhog, sigma: sigma });
    let phi_lo2 = 1 + (4.3*Gamma2 -1)*(Co*x**0.875*(1-x)**0.875 + x**1.75);
    return dP_lo*phi_lo2;
}


export function Chen_Friedel({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of E, dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of E
    let v_go = m/rhog/(Math.PI/4*D**2);
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });

    let F = x**0.78*(1-x)**0.224;
    let H = (rhol/rhog)**0.91*(mug/mul)**0.19*(1 - mug/mul)**0.7;
    let E = (1-x)**2 + x**2*(rhol*fd_go/(rhog*fd_lo));

    // Homogeneous properties, for Froude/Weber numbers
    let rho_h = 1./(x/rhog + (1-x)/rhol);
    let Q_h = m/rho_h;
    let v_h = Q_h/(Math.PI/4*D**2);

    let Fr = Froude( {V: v_h, L: D, squared: true }); // checked with (m/(Math.PI/4*D**2))**2/g/D/rho_h**2
    let We = Weber( {V: v_h, L: D, rho: rho_h, sigma: sigma }); // checked with (m/(Math.PI/4*D**2))**2*D/sigma/rho_h

    let phi_lo2 = E + 3.24*F*H/(Fr**0.0454*We**0.035);

    let dP = phi_lo2*dP_lo;

    // Chen modification; Weber number is the same as above
    // Weber is same
    let Bo = Bond( {rhol: rhol, rhog: rhog, sigma: sigma, L: D })/4; // Custom definition

    if( Bo < 2.5 ) {
        // Actual gas flow, needed for this case only.
        let v_g = m*x/rhog/(Math.PI/4*D**2);
        let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
        let Omega = 0.0333*Re_lo**0.45/(Re_g**0.09*(1 + 0.5*Math.exp(-Bo)));
    } else {
        Omega = We**0.2/(2.5 + 0.06*Bo);
    }
    return dP*Omega;
}


export function Zhang_Webb({m, x, rhol, mul, P, Pc, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);
    let Pr = (Pc === null || P === null) ? 0.5 : P/Pc;
    let phi_lo2 = (1-x)**2 + 2.87*x**2/Pr + 1.68*x**0.8*Math.sqrt(Math.sqrt(1-x))*Pr**-1.64;
    return dP_lo*phi_lo2;
}


export function Bankoff({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    // Liquid-only properties, for calculation of dP_lo
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    let gamma = (0.71 + 2.35*rhog/rhol)/(1. + (1.-x)/x*rhog/rhol);
    let phi_Bf = 1./(1.-x)*(1 - gamma*(1 - rhog/rhol))**(3/7.)*(1. + x*(rhol/rhog -1.));
    return dP_lo*phi_Bf**(7/4.);
}


export function Xu_Fang({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    let A = Math.PI/4*D*D;
    // Liquid-only properties, for calculation of E, dP_lo
    let v_lo = m/rhol/A;
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
    let fd_lo = friction_factor( {Re: Re_lo, eD: roughness/D });
    let dP_lo = fd_lo*L/D*(0.5*rhol*v_lo**2);

    // Gas-only properties, for calculation of E
    let v_go = m/rhog/A;
    let Re_go = Reynolds( {V: v_go, rho: rhog, mu: mug, D: D });
    let fd_go = friction_factor( {Re: Re_go, eD: roughness/D });
    let dP_go = fd_go*L/D*(0.5*rhog*v_go**2);

    // Homogeneous properties, for Froude/Weber numbers
    let voidage_h = homogeneous(x, rhol, rhog);
    let rho_h = rhol*(1-voidage_h) + rhog*voidage_h;

    let Q_h = m/rho_h;
    let v_h = Q_h/A;

    let Fr = Froude( {V: v_h, L: D, squared: true });
    let We = Weber( {V: v_h, L: D, rho: rho_h, sigma: sigma });
    let Y2 = dP_go/dP_lo;

    let phi_lo2 = Y2*x**3 + (1-x**2.59)**0.632*(1 + 2*x**1.17*(Y2-1)
            + 0.00775*x**-0.475*Fr**0.535*We**0.188);

    return phi_lo2*dP_lo;
}


export function Yu_France({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });

    let X = 18.65*Math.sqrt(rhog/rhol)*(1-x)/x*Re_g**0.1/Math.sqrt(Re_l);
    let phi_l2 = X**-1.9;
    return phi_l2*dP_l;
}


export function Wang_Chiang_Lu({m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1.0}) {
    let G_tp = m/(Math.PI/4*D**2);

    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor( {Re: Re_g, eD: roughness/D });
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    let X = Math.sqrt(dP_l/dP_g);

    if( G_tp >= 200 ) {
        let phi_g2 = 1 + 9.397*X**0.62 + 0.564*X**2.45;
    } else {
        // Liquid-only flow; Re_lo is oddly needed
        let v_lo = m/rhol/(Math.PI/4*D**2);
        let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });
        let C = 0.000004566*X**0.128*Re_lo**0.938*(rhol/rhog)**-2.15*(mul/mug)**5.1;
        phi_g2 = 1 + C*X + X**2;
    }
    return dP_g*phi_g2;
}


export function Hwang_Kim({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    // Liquid-only flow
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });

    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor( {Re: Re_g, eD: roughness/D });
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    // Actual model
    let X = Math.sqrt(dP_l/dP_g);
    let Co = Confinement( {D: D, rhol: rhol, rhog: rhog, sigma: sigma });
    let C = 0.227*Re_lo**0.452*X**-0.320*Co**-0.820;
    let phi_l2 = 1 + C/X + 1./X**2;
    return dP_l*phi_l2;
}


export function Zhang_Hibiki_Mishima({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0,
                         L=1.0, flowtype='adiabatic vapor'}) {
    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor( {Re: Re_g, eD: roughness/D });
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    // Actual model
    let X = Math.sqrt(dP_l/dP_g);
    let Co = Confinement( {D: D, rhol: rhol, rhog: rhog, sigma: sigma });

    if( flowtype === 'adiabatic vapor' ) {
        let C = 21*(1 - Math.exp(-0.142/Co));
    } else if( flowtype === 'adiabatic gas' ) {
        C = 21*(1 - Math.exp(-0.674/Co));
    } else if( flowtype === 'flow boiling' ) {
        C = 21*(1 - Math.exp(-0.358/Co));
    } else {
        throw new Error( 'ValueError',"Only flow types 'adiabatic vapor', 'adiabatic gas, and 'flow boiling' are recognized." );
    }

    let phi_l2 = 1 + C/X + 1./X**2;
    return dP_l*phi_l2;
}


export function Mishima_Hibiki({m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1.0}) {
    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor( {Re: Re_l, eD: roughness/D });
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor( {Re: Re_g, eD: roughness/D });
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    // Actual model
    let X = Math.sqrt(dP_l/dP_g);
    let C = 21*(1 - Math.exp(-0.319E3*D));
    let phi_l2 = 1 + C/X + 1./X**2;
    return dP_l*phi_l2;
}

export function friction_factor_Kim_Mudawar(Re) {
    if( Re < 2000 ) {
        return 64./Re;
    } else if( Re < 20000 ) {
        return 0.316/Math.sqrt(Math.sqrt(Re));
    } else {
        return 0.184*Re**-0.2;
    }


}
export function Kim_Mudawar({m, x, rhol, rhog, mul, mug, sigma, D, L=1.0}) {
    // Actual Liquid flow
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let fd_l = friction_factor_Kim_Mudawar(Re=Re_l);
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);

    // Actual gas flow
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });
    let fd_g = friction_factor_Kim_Mudawar(Re=Re_g);
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    // Liquid-only flow
    let v_lo = m/rhol/(Math.PI/4*D**2);
    let Re_lo = Reynolds( {V: v_lo, rho: rhol, mu: mul, D: D });

    let Su = Suratman( {L: D, rho: rhog, mu: mug, sigma: sigma });
    let X = Math.sqrt(dP_l/dP_g);
    let Re_c = 2000; // Transition Reynolds number

    if( Re_l < Re_c && Re_g < Re_c ) {
        let C = 3.5E-5*Re_lo**0.44*Math.sqrt(Su)*(rhol/rhog)**0.48;
    } else if( Re_l < Re_c && Re_g >= Re_c ) {
        C = 0.0015*Re_lo**0.59*Su**0.19*(rhol/rhog)**0.36;
    } else if( Re_l >= Re_c && Re_g < Re_c ) {
        C = 8.7E-4*Re_lo**0.17*Math.sqrt(Su)*(rhol/rhog)**0.14;
    } else { // Turbulent case
        C = 0.39*Re_lo**0.03*Su**0.10*(rhol/rhog)**0.35;
    }

    let phi_l2 = 1 + C/X + 1./X**2;
    return dP_l*phi_l2;
}


export function Lockhart_Martinelli({m, x, rhol, rhog, mul, mug, D, L=1.0, Re_c=2000.0}) {
    let v_l = m*(1-x)/rhol/(Math.PI/4*D**2);
    let Re_l = Reynolds( {V: v_l, rho: rhol, mu: mul, D: D });
    let v_g = m*x/rhog/(Math.PI/4*D**2);
    let Re_g = Reynolds( {V: v_g, rho: rhog, mu: mug, D: D });

    if( Re_l < Re_c && Re_g < Re_c ) {
        let C = 5.0;
    } else if( Re_l < Re_c && Re_g >= Re_c ) {
        // Liquid laminar, gas turbulent
        C = 12.0;
    } else if( Re_l >= Re_c && Re_g < Re_c ) {
        // Liquid turbulent, gas laminar
        C = 10.0;
    } else { // Turbulent case
        C = 20.0;
    }

    // Frictoin factor as in the original model
    let fd_l = Re_l < Re_c ? 64./Re_l : 0.184*Re_l**-0.2;
    let dP_l = fd_l*L/D*(0.5*rhol*v_l**2);
    let fd_g = Re_g < Re_c ? 64./Re_g : 0.184*Re_g**-0.2;
    let dP_g = fd_g*L/D*(0.5*rhog*v_g**2);

    let X = Math.sqrt(dP_l/dP_g);

    let phi_l2 = 1 + C/X + 1./X**2;
    return dP_l*phi_l2;
}


let two_phase_correlations = {
    // 0 index, args are: m, x, rhol, mul, P, Pc, D, roughness=0.0, L=1
    'Zhang_Webb': (Zhang_Webb, 0),
    // 1 index, args are: m, x, rhol, rhog, mul, mug, D, L=1
    'Lockhart_Martinelli': (Lockhart_Martinelli, 1),
    // 2 index, args are: m, x, rhol, rhog, mul, mug, D, roughness=0.0, L=1
    'Bankoff': (Bankoff, 2),
    'Baroczy_Chisholm': (Baroczy_Chisholm, 2),
    'Chisholm': (Chisholm, 2),
    'Gronnerud': (Gronnerud, 2),
    'Jung_Radermacher': (Jung_Radermacher, 2),
    'Muller_Steinhagen_Heck': (Muller_Steinhagen_Heck, 2),
    'Theissing': (Theissing, 2),
    'Wang_Chiang_Lu': (Wang_Chiang_Lu, 2),
    'Yu_France': (Yu_France, 2),
    // 3 index, args are: m, x, rhol, rhog, mul, mug, sigma, D, L=1
    'Kim_Mudawar': (Kim_Mudawar, 3),
    // 4 index, args are: m, x, rhol, rhog, mul, mug, sigma, D, roughness=0.0, L=1
    'Friedel': (Friedel, 4),
    'Hwang_Kim': (Hwang_Kim, 4),
    'Mishima_Hibiki': (Mishima_Hibiki, 4),
    'Tran': (Tran, 4),
    'Xu_Fang': (Xu_Fang, 4),
    'Zhang_Hibiki_Mishima': (Zhang_Hibiki_Mishima, 4),
    'Chen_Friedel': (Chen_Friedel, 4),
    // 5 index: args are m, x, rhol, rhog, sigma, D, L=1
    'Lombardi_Pedrocchi': (Lombardi_Pedrocchi, 5),
    // Misc indexes:
    'Chisholm rough': (Chisholm, 101),
    'Zhang_Hibiki_Mishima adiabatic gas': (Zhang_Hibiki_Mishima, 102),
    'Zhang_Hibiki_Mishima flow boiling': (Zhang_Hibiki_Mishima, 103),
    'Beggs-Brill': (Beggs_Brill, 104)
};
let _unknown_msg_two_phase = `Unknown method; available methods are ${Object.keys(two_phase_correlations)}`;
export function two_phase_dP_methods({m, x, rhol, D, L=1.0, rhog=null, mul=null, mug=null,
                         sigma=null, P=null, Pc=null, roughness=0.0, angle=0,
                         check_ranges=false}) {
    let usable_indices = [];
    if( rhog !== null && sigma !== null ) {
        usable_indices.push(5);
    }
    if( rhog !== null && sigma !== null && mul !== null && mug !== null ) {
        usable_indices.extend([4, 3, 102, 103]); // Differs only in the addition of roughness
    }
    if( rhog !== null && mul !== null && mug !== null ) {
        usable_indices.extend([1,2, 101]); // Differs only in the addition of roughness
    }
    if( mul !== null && P !== null && Pc !== null ) {
        usable_indices.push(0);
    }
    if( (rhog !== null && mul !== null && mug !== null
        && sigma !== null && P !== null && angle !== null) ) {
        usable_indices.push(104);
    }
    return two_phase_correlations.items().filter( ( [ key, value ] ) => value[1] in usable_indices ).map( ( [ key, value ] ) =>key );
}

export function two_phase_dP({m, x, rhol, D, L=1.0, rhog=null, mul=null, mug=null, sigma=null,
                 P=null, Pc=null, roughness=0.0, angle=null, Method=null}) {
    if( Method === null ) {
        if( rhog !== null && mul !== null && mug !== null && sigma !== null ) {
            let Method2 = 'Kim_Mudawar'; // Kim_Mudawar preferred
        } else if( rhog !== null && mul !== null && mug !== null ) {
            Method2 = 'Chisholm'; // Second choice, indexes 1 or 2
    } else if( mul !== null && P !== null && Pc !== null ) {
            Method2 = 'Zhang_Webb'; // Not a good choice
    } else if( rhog !== null && sigma !== null ) {
            Method2 = 'Lombardi_Pedrocchi'; // Last try
    } else {
            throw new Error( 'ValueError','All possible methods require more information than provided; provide more inputs!' );
        }
    } else {
        Method2 = Method;
    }

    if( Method2 === "Zhang_Webb" ) {
        return Zhang_Webb( {m: m, x: x, rhol: rhol, mul: mul, P: P, Pc: Pc, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Lockhart_Martinelli" ) {
        return Lockhart_Martinelli( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, L: L });
    } else if( Method2 === "Bankoff" ) {
        return Bankoff( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Baroczy_Chisholm" ) {
        return Baroczy_Chisholm( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Chisholm" ) {
        return Chisholm( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Gronnerud" ) {
        return Gronnerud( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Jung_Radermacher" ) {
        return Jung_Radermacher( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Muller_Steinhagen_Heck" ) {
        return Muller_Steinhagen_Heck( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Theissing" ) {
        return Theissing( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Wang_Chiang_Lu" ) {
        return Wang_Chiang_Lu( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Yu_France" ) {
        return Yu_France( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Kim_Mudawar" ) {
        return Kim_Mudawar( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, L: L });
    } else if( Method2 === "Friedel" ) {
        return Friedel( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Hwang_Kim" ) {
        return Hwang_Kim( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Mishima_Hibiki" ) {
        return Mishima_Hibiki( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Tran" ) {
        return Tran( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Xu_Fang" ) {
        return Xu_Fang( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Zhang_Hibiki_Mishima" ) {
        return Zhang_Hibiki_Mishima( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Chen_Friedel" ) {
        return Chen_Friedel( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, sigma: sigma, D: D, roughness: roughness, L: L });
    } else if( Method2 === "Lombardi_Pedrocchi" ) {
        return Lombardi_Pedrocchi( {m: m, x: x, rhol: rhol, rhog: rhog, sigma: sigma, D: D, L: L });
    } else if( Method2 === "Chisholm rough" ) {
        return Chisholm( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug, D: D,
                     L: L, roughness: roughness, rough_correction: true });
    } else if( Method2 === "Zhang_Hibiki_Mishima adiabatic gas" ) {
        return Zhang_Hibiki_Mishima( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug,
                     sigma: sigma, D: D, L: L, roughness: roughness,
                     flowtype: 'adiabatic gas' });
    } else if( Method2 === "Zhang_Hibiki_Mishima flow boiling" ) {
        return Zhang_Hibiki_Mishima( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug,
                     sigma: sigma, D: D, L: L, roughness: roughness,
                     flowtype: 'flow boiling' });
    } else if( Method2 === "Beggs-Brill" ) {
        return Beggs_Brill( {m: m, x: x, rhol: rhol, rhog: rhog, mul: mul, mug: mug,
                     sigma: sigma, P: P, D: D, angle: angle, L: L,
                     roughness: roughness, acceleration: false, g: g });
    } else {
        throw new Error( 'ValueError',_unknown_msg_two_phase );
    }


}
export function two_phase_dP_acceleration({m, D, xi, xo, alpha_i, alpha_o, rho_li, rho_gi,
                              rho_lo=null, rho_go=null}) {
    let G = 4*m/(Math.PI*D*D);
    if( rho_lo === null ) {
        let rho_lo = rho_li;
    }
    if( rho_go === null ) {
        let rho_go = rho_gi;
    }
    let in_term = (1.-xi)**2/(rho_li*(1.-alpha_i)) + xi*xi/(rho_gi*alpha_i);
    let out_term = (1.-xo)**2/(rho_lo*(1.-alpha_o)) + xo*xo/(rho_go*alpha_o);
    return G*G*(out_term - in_term);
}


export function two_phase_dP_dz_acceleration({m, D, x, rhol, rhog, dv_dP_l, dv_dP_g, dx_dP,
                                 dP_dL, dA_dL}) {
    let A = 0.25*Math.PI*D*D;
    let G = m/A;
    let t1 = (1.0/rhog - 1.0/rhol)*dP_dL*dx_dP + dP_dL*(x*dv_dP_g + (1.0 - x)*dv_dP_l);

    let voidage_h = homogeneous(x, rhol, rhog);
    let rho_h = rhol*(1.0 - voidage_h) + rhog*voidage_h;
    return -G*G*(t1 - dA_dL/(rho_h*A));
}




export function two_phase_dP_gravitational({angle, z, alpha_i, rho_li, rho_gi,
                               alpha_o=null, rho_lo=null, rho_go=null, g=g}) {
    if( rho_lo === null ) {
        let rho_lo = rho_li;
    }
    if( rho_go === null ) {
        let rho_go = rho_gi;
    }
    if( alpha_o === null ) {
        let alpha_o = alpha_i;
    }
    angle = radians(angle);
    let in_term = alpha_i*rho_gi + (1. - alpha_i)*rho_li;
    let out_term = alpha_o*rho_go + (1. - alpha_o)*rho_lo;
    return g*z*Math.sin(angle)*(out_term + in_term)/2.;
}


export function two_phase_dP_dz_gravitational({angle, alpha, rhol, rhog, g=g}) {
    angle = radians(angle);
    return g*Math.sin(angle)*(alpha*rhog + (1. - alpha)*rhol);
}

let Dukler_XA_tck = implementation_optimize_tck([[-2.4791105294648372, -2.4791105294648372, -2.4791105294648372, -2.4791105294648372, 0.14360803483759585, 1.7199938263676038, 1.7199938263676038, 1.7199938263676038, 1.7199938263676038], [0.21299880246561081, 0.16299733301915248, -0.042340970712679615, -1.9967836909384598, -2.9917366639619414, 0.0, 0.0, 0.0, 0.0], 3]);
let Dukler_XC_tck = implementation_optimize_tck([[-1.8323873272724698, -1.8323873272724698, -1.8323873272724698, -1.8323873272724698, -0.15428198203334137, 1.7031193462360779, 1.7031193462360779, 1.7031193462360779, 1.7031193462360779], [0.2827776229531682, 0.6207113329042158, 1.0609541626742232, 0.44917638072891825, 0.014664597632360495, 0.0, 0.0, 0.0, 0.0], 3]);
let Dukler_XD_tck = implementation_optimize_tck([[0.2532652936901574, 0.2532652936901574, 0.2532652936901574, 0.2532652936901574, 3.5567847823070253, 3.5567847823070253, 3.5567847823070253, 3.5567847823070253], [0.09054274779541564, -0.05102629221303253, -0.23907463153703945, -0.7757156285450911, 0.0, 0.0, 0.0, 0.0], 3]);
let XA_interp_obj = (x) => 10**float(splev(Math.log10(x), Dukler_XA_tck));
let XC_interp_obj = (x) => 10**float(splev(Math.log10(x), Dukler_XC_tck));
let XD_interp_obj = (x) => 10**float(splev(Math.log10(x), Dukler_XD_tck));
export function Taitel_Dukler_regime({m, x, rhol, rhog, mul, mug, D, angle, roughness=0.0,
                         g=g}) {
    angle = radians(angle);
    let A = 0.25*Math.PI*D*D;
    // Liquid-superficial properties, for calculation of dP_ls, dP_ls
    // Paper and Brill Beggs 1991 confirms not v_lo but v_sg
    let v_ls =  m*(1.0 - x)/(rhol*A);
    let Re_ls = Reynolds( {V: v_ls, rho: rhol, mu: mul, D: D });
    let fd_ls = friction_factor( {Re: Re_ls, eD: roughness/D });
    let dP_ls = fd_ls/D*(0.5*rhol*v_ls*v_ls);

    // Gas-superficial properties, for calculation of dP_gs
    let v_gs = m*x/(rhog*A);
    let Re_gs = Reynolds( {V: v_gs, rho: rhog, mu: mug, D: D });
    let fd_gs = friction_factor( {Re: Re_gs, eD: roughness/D });
    let dP_gs = fd_gs/D*(0.5*rhog*v_gs*v_gs);

    let X = Math.sqrt(dP_ls/dP_gs);

    let F = Math.sqrt(rhog/(rhol-rhog))*v_gs/Math.sqrt(D*g*Math.cos(angle));

    // Paper only uses kinematic viscosity
    let nul = mul/rhol;

    let T = Math.sqrt(dP_ls/((rhol-rhog)*g*Math.cos(angle)));
    let K = Math.sqrt(rhog*v_gs*v_gs*v_ls/((rhol-rhog)*g*nul*Math.cos(angle)));

    let F_A_at_X = XA_interp_obj(X);

    let X_B_transition = 1.7917; // Roughly

    if( F >= F_A_at_X && X <= X_B_transition ) {
        let regime = 'annular';
    } else if( F >= F_A_at_X ) {
        let T_D_at_X = XD_interp_obj(X);
        if( T >= T_D_at_X ) {
            regime = 'bubbly';
        } else {
            regime = 'intermittent';
        }
    } else {
        let K_C_at_X = XC_interp_obj(X);
        if( K >= K_C_at_X ) {
            regime = 'stratified wavy';
        } else {
            regime = 'stratified smooth';
        }

    }
    return regime, X, T, F, K;
}


export function Mandhane_Gregory_Aziz_regime({m, x, rhol, rhog, mul, mug, sigma, D}) {
    let A = 0.25*Math.PI*D*D;
    let Vsl =  m*(1.0 - x)/(rhol*A);
    let Vsg = m*x/(rhog*A);

    // Convert to imperial units
    [Vsl, Vsg] = [Vsl/0.3048, Vsg/0.3048];
    //X1 = (rhog/0.0808)**0.333 * (rhol*72.4/62.4/sigma)**0.25 * (mug/0.018)**0.2
    //Y1 = (rhol*72.4/62.4/sigma)**0.25 * (mul/1.)**0.2
    let X1 = (rhog/1.294292)**0.333 * Math.sqrt(Math.sqrt(rhol*0.0724/(999.552*sigma))) * (mug*1.8E5)**0.2;
    let Y1 = Math.sqrt(Math.sqrt(rhol*0.0724/999.552/sigma)) * (mul*1E3)**0.2;

    if( Vsl < 14.0*Y1 ) {
        if( Vsl <= 0.1 ) {
            let Y1345 = 14.0*(Vsl/0.1)**-0.368;
        } else if( Vsl <= 0.2 ) {
            Y1345 = 14.0*(Vsl/0.1)**-0.415;
    } else if( Vsl <= 1.15 ) {
            Y1345 = 10.5*(Vsl/0.2)**-0.816;
    } else if( Vsl <= 4.8 ) {
            Y1345 = 2.5;
    } else {
            Y1345 = 2.5*(Vsl/4.8)**0.248;
        }

        if( Vsl <= 0.1 ) {
            let Y456 = 70.0*(Vsl/0.01)**-0.0675;
        } else if( Vsl <= 0.3 ) {
            Y456 = 60.0*(Vsl/0.1)**-0.415;
    } else if( Vsl <= 0.56 ) {
            Y456 = 38.0*(Vsl/0.3)**0.0813;
    } else if( Vsl <= 1.0 ) {
            Y456 = 40.0*(Vsl/0.56)**0.385;
    } else if( Vsl <= 2.5 ) {
            Y456 = 50.0*(Vsl/1.)**0.756;
    } else {
            Y456 = 100.0*(Vsl/2.5)**0.463;
        }

        let Y45 = 0.3*Y1;
        let Y31 = 0.5/Y1;
        Y1345 = Y1345*X1;
        Y456 = Y456*X1;

        if( Vsg <= Y1345 && Vsl >= Y31 ) {
            let regime = 'elongated bubble';
        } else if( Vsg <= Y1345 && Vsl <= Y31 ) {
            regime = 'stratified';
    } else if( Vsg >= Y1345 && Vsg <= Y456 && Vsl > Y45 ) {
            regime = 'slug';
    } else if( Vsg >= Y1345 && Vsg <= Y456 && Vsl <= Y45 ) {
            regime = 'wave';
    } else {
            regime = 'annular mist';
        }
    } else if( Vsg <= (230.*(Vsl/14.)**0.206)*X1 ) {
        regime = 'dispersed bubble';
    } else {
        regime = 'annular mist';
    }
    return regime, Vsl, Vsg;
}

export let Mandhane_Gregory_Aziz_regimes = {'elongated bubble': 1, 'stratified': 2,
                                 'slug':3, 'wave': 4,
                                 'annular mist': 5, 'dispersed bubble': 6};


