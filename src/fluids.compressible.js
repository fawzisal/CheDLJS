import { R } from './fluids.constants.js' ;
import { secant, newton, ridder, lambertw } from './fluids.numerics_init.js' ;

let __all__ = ['Panhandle_A', 'Panhandle_B', 'Weymouth', 'Spitzglass_high', 'Spitzglass_low', 'Oliphant', 'Fritzsche', 'Muller', 'IGT', 'isothermal_gas', 'isothermal_work_compression', 'polytropic_exponent', 'isentropic_work_compression', 'isentropic_efficiency', 'isentropic_T_rise_compression', 'T_critical_flow', 'P_critical_flow', 'P_isothermal_critical_flow', 'is_critical_flow', 'stagnation_energy', 'P_stagnation', 'T_stagnation', 'T_stagnation_ideal'];
export function isothermal_work_compression({P1, P2, T, Z=1.0}) {
    return Z*R*T*Math.log(P2/P1);
}


export function isentropic_work_compression({T1, k, Z=1.0, P1=null, P2=null, W=null, eta=null}) {
    if( W === null && eta !== null && P1 !== null && P2 !== null ) {
        return k/(k - 1.0)*Z*R*T1*((P2/P1)**((k-1.)/k) - 1.0)/eta;
    } else if( P1 === null && eta !== null && W !== null && P2 !== null ) {
        return P2*(1.0 + W*eta/(R*T1*Z) - W*eta/(R*T1*Z*k))**(-k/(k - 1.0));
    } else if( P2 === null && eta !== null && W !== null && P1 !== null ) {
            return P1*(1.0 + W*eta/(R*T1*Z) - W*eta/(R*T1*Z*k))**(k/(k - 1.0));
    } else if( eta === null && P1 !== null && P2 !== null && W !== null ) {
            return R*T1*Z*k*((P2/P1)**((k - 1.0)/k) - 1.0)/(W*(k - 1.0));
    } else {
        throw new Error( 'ValueError - Three of W, P1, P2, and eta must be specified.' );
    }


}
export function isentropic_T_rise_compression({T1, P1, P2, k, eta=1}) {
    let dT = T1*((P2/P1)**((k - 1.0)/k) - 1.0)/eta;
    return T1 + dT;
}


export function isentropic_efficiency({P1, P2, k, eta_s=null, eta_p=null}) {
    if( eta_s === null && eta_p !== null ) {
        return ((P2/P1)**((k-1.0)/k)-1.0)/((P2/P1)**((k-1.0)/(k*eta_p))-1.0);
    } else if( eta_p === null && eta_s !== null ) {
        return (k - 1.0)*Math.log(P2/P1)/(k*Math.log(
            (eta_s + (P2/P1)**((k - 1.0)/k) - 1.0)/eta_s));
    } else {
        throw new Error( 'ValueError - Either eta_s or eta_p is required' );
    }


}
export function polytropic_exponent({k, n=null, eta_p=null}) {
    if( n === null && eta_p !== null ) {
        return k*eta_p/(1.0 - k*(1.0 - eta_p));
    } else if( eta_p === null && n !== null ) {
        return n*(k - 1.0)/(k*(n - 1.0));
    } else {
        throw new Error( 'ValueError - Either n or eta_p is required' );
    }


}
export function T_critical_flow({T, k}) {
    return T*2.0/(k + 1.0);
}


export function P_critical_flow({P, k}) {
    return P*(2.0/(k + 1.))**(k/(k - 1.0));
}


export function P_isothermal_critical_flow({P, fd, D, L}) {
    // Correct branch of lambertw found by trial and error
    // TODO: figure out how complex numbers fit here
    // let lambert_term = ((lambertw(-Math.exp((-D - L*fd)/D), -1)).real);
    let lambert_term = ((lambertw(-Math.exp((-D - L*fd)/D), -1)));
    return P*Math.exp((D*(lambert_term + 1.0) + L*fd)/(2.0*D));
}


export function P_upstream_isothermal_critical_flow({P, fd, D, L}) {
    // TODO: figure out how complex numbers fit here
    // let lambertw_term = (lambertw(-Math.exp(-(fd*L+D)/D), -1).real);
    let lambertw_term = (lambertw(-Math.exp(-(fd*L+D)/D), -1));
    return Math.exp(-0.5*(D*lambertw_term+fd*L+D)/D)*P;
}


export function is_critical_flow({P1, P2, k}) {
    let Pcf = P_critical_flow({P: P1, k: k});
    return Pcf > P2;
}


export function stagnation_energy(V) {
    return 0.5*V*V;
}


export function P_stagnation({P, T, Tst, k}) {
    return P*(Tst/T)**(k/(k - 1.0));
}


export function T_stagnation({T, P, Pst, k}) {
    return T*(Pst/P)**((k - 1.0)/k);
}


export function T_stagnation_ideal({T, V, Cp}) {
    return T + 0.5*V*V/Cp;
}

export function isothermal_gas_err_P1({P1, fd, rho, P2, L, D, m}) {
    return m - isothermal_gas({rho: rho, fd:fd, P1: P1, P2: P2, L: L, D: D });
}

export function isothermal_gas_err_P2({P2, rho, fd, P1, L, D, m}) {
    return m - isothermal_gas({rho: rho, fd:fd, P1: P1, P2: P2, L: L, D: D });
}

export function isothermal_gas_err_P2_basis({P1, P2, rho, fd, m, L, D}) {
    return abs(P2 - isothermal_gas({rho: rho, fd:fd, m: m, P1: P1, P2: null, L: L, D: D }));
}

export function isothermal_gas_err_D({D, m, rho, fd, P1, P2, L}) {
    return m - isothermal_gas({rho: rho, fd:fd, P1: P1, P2: P2, L: L, D: D });
}

export function isothermal_gas({rho, fd, P1=null, P2=null, L=null, D=null, m=null}) {
    let Pcf;
    if( m === null && P1 !== null && P2 !== null && L !== null && D !== null ) {
        Pcf = P_isothermal_critical_flow( {P: P1, fd: fd, D: D, L: L });
        if( P2 < Pcf ) {
            throw new Error( 'ValueError',_pyjs.stringInterpolate( 'Given outlet pressure is not physically possible due to the formation of choked flow at P2=%f, specified outlet pressure was %f', [Pcf, P2] ) ); // numba: delete
        }
        if( P2 > P1 ) {
            throw new Error( 'ValueError - Specified outlet pressure is larger than the inlet pressure; fluid will flow backwards.' );
        }
        return Math.sqrt(0.0625*Math.PI*Math.PI*D**4*rho/(P1*(fd*L/D + 2.0*Math.log(P1/P2)))*(P1*P1 - P2*P2));
    } else if( L === null && P1 !== null && P2 !== null && D !== null && m !== null ) {
        return D*(Math.PI*Math.PI*D**4*rho*(P1*P1 - P2*P2) - 32.0*P1*m*m*Math.log(P1/P2))/(16.0*P1*fd*m*m);
    } else if( P1 === null && L !== null && P2 !== null && D !== null && m !== null ) {
        Pcf = P_upstream_isothermal_critical_flow( {P: P2, fd: fd, D: D, L: L });

        try {
            // Use the explicit solution for P2 with different P1 guesses;
            // newton doesn't like solving for m.
            let P1 = secant({func: isothermal_gas_err_P2_basis, x0: (P2+Pcf)/2., args: [P2, rho, fd, m, L, D] });
            if( !(P2 <= P1) ) {
                throw new Error( 'ValueError',"Failed" );
            }
            return P1;
        } catch( e ) {
            try {
                return ridder(isothermal_gas_err_P1, { a: P2, b: Pcf, args: [fd, rho, P2, L, D, m] });
            } catch( e ) {
                let m_max = isothermal_gas(rho, fd, { P1: Pcf, P2: P2, L: L, D: D });  // numba: delete
                throw new Error( 'ValueError',_pyjs.stringInterpolate( 'The desired mass flow rate of %f kg/s cannot be achieved with the specified downstream pressure; the maximum flowrate is %f kg/s at an upstream pressure of %f Pa',[m, m_max, Pcf] ) ); // numba: delete
            }
            //raise ValueError("Failed") # numba: uncomment
        }
    } else if( P2 === null && L !== null && P1 !== null && D !== null && m !== null ) {
        try {
            Pcf = P_isothermal_critical_flow( {P: P1, fd: fd, D: D, L: L });
            m_max = isothermal_gas(rho, fd, { P1: P1, P2: Pcf, L: L, D: D });
            if( !(m <= m_max) ) {
                throw new Error( 'ValueError',"Failed" );
            }
            let C = fd*L/D;
            let B = (Math.PI/4*D**2)**2*rho;
            let arg = -B/m**2*P1*Math.exp(-(-C*m**2+B*P1)/m**2);
            // Consider the two real branches of the lambertw function.
            // The k=-1 branch produces the higher P2 values; the k=0 branch is
            // physically impossible.
            // TODO: figure out how complex numbers fit here
            // let lambert_ans = (lambertw(arg, { k: -1 }).real);
            let lambert_ans = (lambertw(arg, { k: -1 }));
            // Large overflow problem here; also divide by zero problems!
            // Fail and try a numerical solution if it doesn't work.
            if( !isFinite(lambert_ans) ) {
                throw new Error( 'ValueError',"Should not be infinity" );
            }
            let P2 = P1/Math.exp((-C*m**2+lambert_ans*m**2+B*P1)/m**2/2.);
            if( !(P2 < P1) ) {
                throw new Error( 'ValueError',"Should not be the case" );
            }
            return P2;
        } catch( e ) {
            Pcf = P_isothermal_critical_flow( {P: P1, fd: fd, D: D, L: L });
            try {
                return ridder(isothermal_gas_err_P2, { a: Pcf, b: P1, args: [rho, fd, P1, L, D, m] });
            } catch( e ) {
                m_max = isothermal_gas(rho, fd, { P1: P1, P2: Pcf, L: L, D: D });
                throw new Error( 'ValueError',_pyjs.stringInterpolate( 'The desired mass flow rate cannot be achieved with the specified upstream pressure of %f Pa; the maximum flowrate is %f kg/s at a downstream pressure of %f',[P1, m_max, Pcf] ) ); // numba: delete
            }
               // raise ValueError("Failed") # numba: uncomment
            // A solver which respects its boundaries is required here.
            // ridder cuts the time down from 2 ms to 200 mircoseconds.
            // Is is believed Pcf and P1 will always bracked the root, however
            // leave the commented code for testing
        }
    } else if( D === null && P2 !== null && P1 !== null && L !== null && m !== null ) {
        return secant({func: isothermal_gas_err_D, x0: 0.1, args: [m, rho, fd, P1, P2, L] });
    } else {
        throw new Error( 'ValueError - This function solves for either mass flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function Panhandle_A({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
                Ps=101325., Zavg=1.0, E=0.92}) {
    let c1 = 1.0788;
    let c2 = 0.8539;
    let c3 = 0.5394;
    let c4 = 2.6182;
    let c5 = 158.0205328706957220332831680508433862787; // 45965*10**(591/1250)/864
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*E*(Ts/Ps)**c1*((P1**2 - P2**2)/(L*SG**c2*Tavg*Zavg))**c3*D**c4;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Q*(Ts/Ps)**(-c1)*(SG**(-c2)*(P1**2 - P2**2)/(L*Tavg*Zavg))**(-c3)/(E*c5))**(1./c4);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*SG**c2*Tavg*Zavg*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(1./c3) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*SG**c2*Tavg*Zavg*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(1./c3) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return SG**(-c2)*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(-1./c3)*(P1**2 - P2**2)/(Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function Panhandle_B({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
                Ps=101325., Zavg=1.0, E=0.92}) {
    let c1 = 1.02; // reference condition power
    let c2 = 0.961; // sg power
    let c3 = 0.51; // main power
    let c4 = 2.53; // diameter power
    let c5 = 152.8811634298055458624385985866624419060; // 4175*10**(3/25)/36
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*E*(Ts/Ps)**c1*((P1**2 - P2**2)/(L*SG**c2*Tavg*Zavg))**c3*D**c4;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Q*(Ts/Ps)**(-c1)*(SG**(-c2)*(P1**2 - P2**2)/(L*Tavg*Zavg))**(-c3)/(E*c5))**(1./c4);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*SG**c2*Tavg*Zavg*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(1./c3) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*SG**c2*Tavg*Zavg*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(1./c3) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return SG**(-c2)*(D**(-c4)*Q*(Ts/Ps)**(-c1)/(E*c5))**(-1./c3)*(P1**2 - P2**2)/(Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function Weymouth({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
             Ps=101325., Zavg=1.0, E=0.92}) {
    let c3 = 0.5; // main power
    let c4 = 2.667; // diameter power
    let c5 = 137.3295809942512546732179684618143090992; // 37435*10**(501/1000)/864
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*E*(Ts/Ps)*((P1**2 - P2**2)/(L*SG*Tavg*Zavg))**c3*D**c4;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Ps*Q*((P1**2 - P2**2)/(L*SG*Tavg*Zavg))**(-c3)/(E*Ts*c5))**(1./c4);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*SG*Tavg*Zavg*(D**(-c4)*Ps*Q/(E*Ts*c5))**(1./c3) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*SG*Tavg*Zavg*(D**(-c4)*Ps*Q/(E*Ts*c5))**(1./c3) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return (D**(-c4)*Ps*Q/(E*Ts*c5))**(-1./c3)*(P1**2 - P2**2)/(SG*Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function _to_solve_Spitzglass_high({D, Q, SG, Tavg, L, P1, P2, Ts, Ps, Zavg, E}) {
     return Q - Spitzglass_high( {SG: SG, Tavg: Tavg, L: L, D: D,
                                  P1: P1, P2: P2, Ts: Ts, Ps: Ps,Zavg: Zavg, E: E });
}

export function Spitzglass_high({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
                Ps=101325., Zavg=1.0, E=1.}) {
    let c3 = 1.181102362204724409448818897637795275591; // 0.03/inch or 150/127
    let c4 = 0.09144;
    let c5 = 125.1060;
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return (c5*E*Ts/Ps*D**2.5*Math.sqrt((P1**2-P2**2)
                        /(L*SG*Zavg*Tavg*(1 + c4/D + c3*D))));
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        let _to_solve_Spitzglass_high_wrapper = function(D){ _to_solve_Spitzglass_high({D: D, Q: Q, SG: SG, Tavg: Tavg, L: L, P1: P1, P2: P2, Ts: Ts, Ps: Ps, Zavg: Zavg, E: E}) };
        return secant({func: _to_solve_Spitzglass_high_wrapper, x0: 0.5});
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt((D**6*E**2*P2**2*Ts**2*c5**2
                         + D**2*L*Ps**2*Q**2*SG*Tavg*Zavg*c3
                         + D*L*Ps**2*Q**2*SG*Tavg*Zavg
                         + L*Ps**2*Q**2*SG*Tavg*Zavg*c4)/(D**6*E**2*Ts**2*c5**2));
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt((D**6*E**2*P1**2*Ts**2*c5**2
                         - D**2*L*Ps**2*Q**2*SG*Tavg*Zavg*c3
                         - D*L*Ps**2*Q**2*SG*Tavg*Zavg
                         - L*Ps**2*Q**2*SG*Tavg*Zavg*c4)/(D**6*E**2*Ts**2*c5**2));
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return (D**6*E**2*Ts**2*c5**2*(P1**2 - P2**2)
                /(Ps**2*Q**2*SG*Tavg*Zavg*(D**2*c3 + D + c4)));
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }

}
export function _to_solve_Spitzglass_low({D, Q, SG, Tavg, L, P1, P2, Ts, Ps, Zavg, E}) {
    return Q - Spitzglass_low( {SG: SG, Tavg: Tavg, L: L, D: D, P1: P1, P2: P2, Ts: Ts, Ps: Ps, Zavg: Zavg, E: E });
}

export function Spitzglass_low({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
                Ps=101325., Zavg=1.0, E=1.}) {
    let c3 = 1.181102362204724409448818897637795275591; // 0.03/inch or 150/127
    let c4 = 0.09144;
    let c5 = 125.1060;
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*Ts/Ps*D**2.5*E*Math.sqrt(((P1-P2)*2*(Ps+1210.))/(L*SG*Tavg*Zavg*(1 + c4/D + c3*D)));
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        let _to_solve_Spitzglass_low_wrapper = function(D){ _to_solve_Spitzglass_low({D: D, Q: Q, SG: SG, Tavg: Tavg, L: L, P1: P1, P2: P2, Ts: Ts, Ps: Ps, Zavg: Zavg, E: E}) };
        return secant({func: _to_solve_Spitzglass_low_wrapper, x0: 0.5 });
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return 0.5*(2.0*D**6*E**2*P2*Ts**2*c5**2*(Ps + 1210.0) + D**2*L*Ps**2*Q**2*SG*Tavg*Zavg*c3 + D*L*Ps**2*Q**2*SG*Tavg*Zavg + L*Ps**2*Q**2*SG*Tavg*Zavg*c4)/(D**6*E**2*Ts**2*c5**2*(Ps + 1210.0));
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return 0.5*(2.0*D**6*E**2*P1*Ts**2*c5**2*(Ps + 1210.0) - D**2*L*Ps**2*Q**2*SG*Tavg*Zavg*c3 - D*L*Ps**2*Q**2*SG*Tavg*Zavg - L*Ps**2*Q**2*SG*Tavg*Zavg*c4)/(D**6*E**2*Ts**2*c5**2*(Ps + 1210.0));
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return 2.0*D**6*E**2*Ts**2*c5**2*(P1*Ps + 1210.0*P1 - P2*Ps - 1210.0*P2)/(Ps**2*Q**2*SG*Tavg*Zavg*(D**2*c3 + D + c4));
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }

}
export function _to_solve_Oliphant({D, Q, SG, Tavg, L, P1, P2, Ts, Ps, Zavg, E}) {
    return Q - Oliphant( {SG: SG, Tavg: Tavg, L: L, D: D, P1: P1, P2: P2, Ts: Ts, Ps: Ps, Zavg: Zavg, E: E });
}

export function Oliphant({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
             Ps=101325., Zavg=1.0, E=0.92}) {
    // c1 = 42*24*Q*foot**3/day*(mile)**0.5*9/5.*(5/9.)**0.5*psi*(1/psi)*14.4/520.*0.6**0.5*520**0.5/inch**2.5
    let c1 = 84.587176139918568651410168968141078948974609375000;
    let c2 = 0.2091519350460528670065940559652517549694; // 1/(30.*0.0254**0.5)
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c1*(D**2.5 + c2*D**3)*Ts/Ps*Math.sqrt((P1**2-P2**2)/(L*SG*Tavg));
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        let _to_solve_Oliphant_wrapper = function(D){ _to_solve_Oliphant({D: D, Q: Q, SG: SG, Tavg: Tavg, L: L, P1: P1, P2: P2, Ts: Ts, Ps: Ps, Zavg: Zavg, E: E}) };
        return secant({func: _to_solve_Oliphant_wrapper, x0: 0.5 });
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*Ps**2*Q**2*SG*Tavg/(Ts**2*c1**2*(D**3*c2 + D**2.5)**2) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*Ps**2*Q**2*SG*Tavg/(Ts**2*c1**2*(D**3*c2 + D**2.5)**2) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return Ts**2*c1**2*(P1**2 - P2**2)*(D**3*c2 + D**2.5)**2/(Ps**2*Q**2*SG*Tavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream  pressure, downstream pressure, diameter, or length; all other inputs  must be provided.' );
    }


}
export function Fritzsche({SG, Tavg, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
              Ps=101325., Zavg=1.0, E=1.0}) {
    // Rational('2.827E-3')/(3600*24)*(1000)**Rational('2.69')*(1000)**Rational('0.538')*1000/(1000**2)**Rational('0.538')
    let c5 = 93.50009798751128188757518688244137811221; // 14135*10**(57/125)/432
    let c2 = 0.8587;
    let c3 = 0.538;
    let c4 = 2.69;
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*E*(Ts/Ps)*((P1**2 - P2**2)/(SG**c2*Tavg*L*Zavg))**c3*D**c4;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Ps*Q*(SG**(-c2)*(P1**2 - P2**2)/(L*Tavg*Zavg))**(-c3)/(E*Ts*c5))**(1./c4);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*SG**c2*Tavg*Zavg*(D**(-c4)*Ps*Q/(E*Ts*c5))**(1./c3) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*SG**c2*Tavg*Zavg*(D**(-c4)*Ps*Q/(E*Ts*c5))**(1./c3) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return SG**(-c2)*(D**(-c4)*Ps*Q/(E*Ts*c5))**(-1./c3)*(P1**2 - P2**2)/(Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function Muller({SG, Tavg, mu, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
           Ps=101325., Zavg=1.0, E=1.0}) {
    // 1000*foot**3/hour*0.4937/inch**2.725*foot**0.575*(5/9.)**0.575*9/5.*(pound/foot)**0.15*psi*(1/psi**2)**0.575
    let c5 = 15.77439908642077352939746374951659525108; // 5642991*196133**(17/20)*2**(3/5)*3**(11/40)*5**(7/40)/30645781250
    let c2 = 0.575; // main power
    let c3 = 2.725; // D power
    let c4 = 0.425; // SG power
    let c1 = 0.15; // mu power
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*Ts/Ps*E*((P1**2-P2**2)/Tavg/L/Zavg)**c2*D**c3/SG**c4/mu**c1;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Ps*Q*SG**c4*mu**c1*((P1**2 - P2**2)/(L*Tavg*Zavg))**(-c2)/(E*Ts*c5))**(1./c3);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*Tavg*Zavg*(D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(1/c2) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*Tavg*Zavg*(D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(1/c2) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return (D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(-1/c2)*(P1**2 - P2**2)/(Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
export function IGT({SG, Tavg, mu, L=null, D=null, P1=null, P2=null, Q=null, Ts=288.7,
        Ps=101325., Zavg=1.0, E=1.0}) {
    // 1000*foot**3/hour*0.6643/inch**(8/3.)*foot**(5/9.)*(5/9.)**(5/9.)*9/5.*(pound/foot)**(1/9.)*psi*(1/psi**2)**(5/9.)
    let c5 = 24.62412451461407054875301709443930350550; // 1084707*196133**(8/9)*2**(1/9)*6**(1/3)/4377968750
    let c2 = 5/9.; // main power
    let c3 = 8/3.; // D power
    let c4 = 4/9.; // SG power
    let c1 = 1/9.; // mu power
    if( Q === null && L !== null && D !== null && P1 !== null && P2 !== null ) {
        return c5*Ts/Ps*E*((P1**2-P2**2)/Tavg/L/Zavg)**c2*D**c3/SG**c4/mu**c1;
    } else if( D === null && L !== null && Q !== null && P1 !== null && P2 !== null ) {
        return (Ps*Q*SG**c4*mu**c1*((P1**2 - P2**2)/(L*Tavg*Zavg))**(-c2)/(E*Ts*c5))**(1./c3);
    } else if( P1 === null && L !== null && Q !== null && D !== null && P2 !== null ) {
        return Math.sqrt(L*Tavg*Zavg*(D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(1/c2) + P2**2);
    } else if( P2 === null && L !== null && Q !== null && D !== null && P1 !== null ) {
        return Math.sqrt(-L*Tavg*Zavg*(D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(1/c2) + P1**2);
    } else if( L === null && P2 !== null && Q !== null && D !== null && P1 !== null ) {
        return (D**(-c3)*Ps*Q*SG**c4*mu**c1/(E*Ts*c5))**(-1/c2)*(P1**2 - P2**2)/(Tavg*Zavg);
    } else {
        throw new Error( 'ValueError - This function solves for either flow, upstream pressure, downstream pressure, diameter, or length; all other inputs must be provided.' );
    }


}
