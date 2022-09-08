import { R, psi, gallon, minute } from './fluids.constants.js';
import { interp, implementation_optimize_tck, splev } from './fluids.numerics_init.js';
import { Cv_to_Kv, Kv_to_Cv } from './fluids.fittings.js';

let __all__ = ['size_control_valve_l', 'size_control_valve_g', 'cavitation_index', 'FF_critical_pressure_ratio_l', 'is_choked_turbulent_l', 'is_choked_turbulent_g', 'Reynolds_valve', 'loss_coefficient_piping', 'Reynolds_factor', 'Cv_char_quick_opening', 'Cv_char_linear', 'Cv_char_equal_percentage', 'convert_flow_coefficient', 'control_valve_choke_P_l', 'control_valve_choke_P_g', 'control_valve_noise_l_2015', 'control_valve_noise_g_2011'];

let N1 = 0.1; // m^3/hr, kPa
let N2 = 1.6E-3; // mm
let N4 = 7.07E-2; // m^3/hr, m^2/s
let N5 = 1.8E-3; // mm
let N6 = 3.16; // kg/hr, kPa, kg/m^3
let N7 = 4.82; // m^3/hr kPa K
let N8 = 1.10; // kPa kg/hr K
//N9 = 2.60E1 # m^3/hr kPa K at 15 deg C
let N9 = 2.46E1; // m^3/hr kPa K at 0 deg C
let N18 = 8.65E-1; // mm
let N19 = 2.5; // mm
//N22 = 1.84E1 # m^3/hr kPa K at 15 deg C
let N27 = 7.75E-1; // kg/hr kPa K at 0 deg C
let N32 = 1.4E2; // mm


let rho0 = 999.10329075702327; // Water at 288.15 K
export function cavitation_index({P1, P2, Psat}) {
    return (P1 - Psat)/(P1 - P2);
}


export function FF_critical_pressure_ratio_l({Psat, Pc}) {
    return 0.96 - 0.28*Math.sqrt(Psat/Pc);
}


export function control_valve_choke_P_l({Psat, Pc, FL, P1=null, P2=null, disp=true}) {
    let FF = 0.96 - 0.28*Math.sqrt(Psat/Pc); //FF_critical_pressure_ratio_l(Psat=Psat, Pc=Pc)
    let Pmin_absolute = FF*Psat;
    if( P2 === null ) {
        let ans = P2 = FF*FL*FL*Psat - FL*FL*P1 + P1;
    } else if( P1 === null ) {
        ans = P1 = (FF*FL*FL*Psat - P2)/(FL*FL - 1.0);
    } else {
        throw new Error( 'ValueError','Either P1 or P2 needs to be specified' );
    }
    if( P2 > P1 && disp ) {
        throw new Error( 'ValueError',_pyjs.stringInterpolate( 'Specified P1 is too low for choking to occur at any downstream pressure; minimum upstream pressure for choking to be possible is %g Pa.', [Pmin_absolute ] ) );
    }
    return ans;
}


export function control_valve_choke_P_g({xT, gamma, P1=null, P2=null}) {
    if( P2 === null ) {
        let ans = P2 = P1*(-5.0*gamma*xT + 7.0)/7.0;
    } else if( P1 === null ) {
        ans = P1 = -7.0*P2/(5.0*gamma*xT - 7.0);
    } else {
        throw new Error( 'ValueError','Either P1 or P2 needs to be specified' );
    }
    return ans;
}


export function is_choked_turbulent_l({dP, P1, Psat, FF, FL=null, FLP=null, FP=null}) {
    if( FLP && FP ) {
        return dP >= FLP*FLP/(FP*FP)*(P1-FF*Psat);
    } else if( FL ) {
        return dP >= FL*FL*(P1-FF*Psat);
    } else {
        throw new Error( 'ValueError','Either (FLP and FP) or FL is needed' );
    }


}
export function is_choked_turbulent_g({x, Fgamma, xT=null, xTP=null}) {
    if( xT ) {
        return x >= Fgamma*xT;
    } else if( xTP ) {
        return x >= Fgamma*xTP;
    } else {
        throw new Error( 'ValueError','Either xT or xTP is needed' );
    }


}
export function Reynolds_valve({nu, Q, D1, FL, Fd, C}) {
    return N4*Fd*Q/nu*1.0/Math.sqrt(C*FL)*Math.sqrt(Math.sqrt(FL*FL*C*C/N2*D1**-4.0 + 1.0));
}


export function loss_coefficient_piping({d, D1=null, D2=null}) {
    let loss = 0.;
    if( D1 ) {
        let dr = d/D1;
        let dr2 = dr*dr;
        loss += 1. - dr2*dr2; // Inlet flow energy
        loss += 0.5*(1. - dr2)*(1.0 - dr2); // Inlet reducer
    }
    if( D2 ) {
        dr = d/D2;
        dr2 = dr*dr;
        loss += 1.0*(1. - dr2)*(1.0 - dr2); // Outlet reducer (expander)
        loss -= 1. - dr2*dr2; // Outlet flow energy
    }
    return loss;
}


export function Reynolds_factor({FL, C, d, Rev, full_trim=true}) {
    if( full_trim ) {
        let n1 = N2/(min(C/(d*d), 0.04))**2; // C/d**2 must not exceed 0.04
        let FR_1a = 1.0 + (0.33*Math.sqrt(FL))/Math.sqrt(Math.sqrt(n1))*Math.log10(Rev/10000.);
        let FR_2 = 0.026/FL*Math.sqrt(n1*Rev);
        if( Rev < 10.0 ) {
            let FR = FR_2;
        } else {
            FR = min(FR_2, FR_1a);
        }
    } else {
        let n2 = 1 + N32*(C/d**2)**(2/3.);
        let FR_3a = 1 + (0.33*Math.sqrt(FL))/Math.sqrt(Math.sqrt(n2))*Math.log10(Rev/10000.);
        let FR_4 = min(0.026/FL*Math.sqrt(n2*Rev), 1);
        if( Rev < 10 ) {
            FR = FR_4;
        } else {
            FR = min(FR_3a, FR_4);
        }
    }
    return FR;
}


export function size_control_valve_l({rho, Psat, Pc, mu, P1, P2, Q, D1=null, D2=null,
                         d=null, FL=0.9, Fd=1, allow_choked=true,
                         allow_laminar=true, full_output=false}) {
    if( full_output ) {
        let ans = {'FLP': null, 'FP': null, 'FR': null};
    }
    [P1, P2, Psat, Pc] = [P1/1000., P2/1000., Psat/1000., Pc/1000.];
    Q = Q*3600.; // m^3/s to m^3/hr, according to constants in standard
    let nu = mu/rho; // kinematic viscosity used in standard
    let MAX_C_POSSIBLE = 1E40; // Quit iterations if C reaches this high

    let dP = P1 - P2;
    let FF = FF_critical_pressure_ratio_l( {Psat: Psat, Pc: Pc });
    let choked = is_choked_turbulent_l( {dP: dP, P1: P1, Psat: Psat, FF: FF, FL: FL });
    if( choked && allow_choked ) {
        // Choked flow, equation 3
        let C = Q/N1/FL*Math.sqrt(rho/rho0/(P1 - FF*Psat));
    } else {
        // non-choked flow, eq 1
        C = Q/N1*Math.sqrt(rho/rho0/dP);
    }
    if( D1 === null && D2 === null && d === null ) {
        // Assume turbulent if no diameters are provided, no other calculations
        let Rev = 1e5;
    } else {
        // m to mm, according to constants in standard
        let [D1, D2, d] = [D1*1000., D2*1000., d*1000.];
        Rev = Reynolds_valve( {nu: nu, Q: Q, D1: D1, FL: FL, Fd: Fd, C: C });
        // normal calculation path
        if( (Rev > 10000 || !allow_laminar) && (D1 !== d || D2 !== d) ) {
            // liquid, using Fp and FLP
            let FP = 1.0;
            let Ci = C;
            let MAX_ITER = 20;
            function iterate_piping_turbulent_l({Ci, iterations}) {
                let loss = loss_coefficient_piping(d, D1, D2);
                let FP = 1.0/Math.sqrt(1 + loss/N2*(Ci/d**2)**2);
                if( d > D1 ) {
                    let loss_upstream = 0.0;
                } else {
                    let loss_upstream = loss_coefficient_piping(d, D1);
                }

                let FLP = FL*1.0/Math.sqrt(1 + FL**2/N2*loss_upstream*(Ci/d**2)**2);
                let choked = is_choked_turbulent_l(dP, P1, Psat, FF, { FLP: FLP, FP: FP });
                if( choked ) {
                    // Choked flow with piping, equation 4
                    let C = Q/N1/FLP*Math.sqrt(rho/rho0/(P1-FF*Psat));
                } else {
                    // Non-Choked flow with piping, equation 5
                    C = Q/N1/FP*Math.sqrt(rho/rho0/dP);
                }
                if( Ci/C < 0.99 && iterations < MAX_ITER && Ci < MAX_C_POSSIBLE ) {
                    C = iterate_piping_turbulent_l(C, iterations+1);
                }
                if( MAX_ITER === iterations || Ci >= MAX_C_POSSIBLE ) {
                    ans['warning'] = 'Not converged in inner loop';
                }
                if( full_output ) {
                    ans['FLP'] = FLP;
                    ans['FP'] = FP;
                }
                return C;
            }

            C = iterate_piping_turbulent_l(Ci, 0);
        } else if( Rev <= 10000 && allow_laminar ) {
            // Laminar
                        function iterate_piping_laminar_l(C) {
                let Ci = 1.3*C;
                let Rev = Reynolds_valve( {nu: nu, Q: Q, D1: D1, FL: FL, Fd: Fd, C: Ci });
                if( Ci/d**2 > 0.016*N18 ) {
                    let FR = Reynolds_factor( {FL: FL, C: Ci, d: d, Rev: Rev, full_trim: false });
                } else {
                    let FR = Reynolds_factor( {FL: FL, C: Ci, d: d, Rev: Rev, full_trim: true });
                }
                if( C/FR >= Ci ) {
                    Ci = iterate_piping_laminar_l(Ci); // pragma: no cover
                }
                if( full_output ) {
                    ans['Rev'] = Rev;
                    ans['FR'] = FR;
                }
                return Ci;
            }
            C = iterate_piping_laminar_l(C);
    }
    }
    if( full_output ) {
        ans['FF'] = FF;
        ans['choked'] = choked;
        ans['Kv'] = C;
        ans['laminar'] = Rev <= 10000;

        // For the laminar case this is already set and needs to not be overwritten
        if( ans.indefOf('Rev') == -1 ) {
            ans['Rev'] = Rev;
        }
        return ans;
    } else {
        //return C, choked, laminar, FF, FR, Rev, FP, FLP, warning
        return C;
    }


}
export function size_control_valve_g({T, MW, mu, gamma, Z, P1, P2, Q, D1=null, D2=null,
                         d=null, FL=0.9, Fd=1, xT=0.7, allow_choked=true,
                         allow_laminar=true, full_output=false}) {
    let MAX_C_POSSIBLE = 1E40; // Quit iterations if C reaches this high
    // Pa to kPa, according to constants in standard
    [P1, P2] = [P1*1e-3, P2*1e-3];
    Q = Q*3600.; // m^3/s to m^3/hr, according to constants in standard
    // Convert dynamic viscosity to kinematic viscosity
    let Vm = Z*R*T/(P1*1000);
    let rho = MW*1e-3/Vm;
    let nu = mu/rho; // kinematic viscosity used in standard

    let dP = P1 - P2;
    let Fgamma = gamma/1.40;
    let x = dP/P1;
    let Y = max(1 - x/(3*Fgamma*xT), 2/3.);

    let choked = is_choked_turbulent_g(x, Fgamma, xT);
    if( choked && allow_choked ) {
        // Choked, and flow coefficient from eq 14a
        let C = Q/(N9*P1*Y)*Math.sqrt(MW*T*Z/xT/Fgamma);
    } else {
        // Non-choked, and flow coefficient from eq 8a
        C = Q/(N9*P1*Y)*Math.sqrt(MW*T*Z/x);
    }


    if( full_output ) { // numba: delete
        let ans = {'FP': null, 'xTP': null, 'FR': null, 'choked': choked, 'Y': Y};  // numba: delete
    }
    if( D1 === null && D2 === null && d === null ) {
        // Assume turbulent if no diameters are provided, no other calculations
        let Rev = 1e5;
        if( full_output ) {  // numba: delete
            ans['Rev'] = null;
        }
    } else {
        // m to mm, according to constants in standard
        let [D1, D2, d] = [D1*1000., D2*1000., d*1000.]; // Convert diameters to mm which is used in the standard
        Rev = Reynolds_valve( {nu: nu, Q: Q, D1: D1, FL: FL, Fd: Fd, C: C });
        if( full_output ) {  // numba: delete
            ans['Rev'] = Rev;
        }
        if( (Rev > 10000 || !allow_laminar) && (D1 !== d || D2 !== d) ) {
            // gas, using xTP and FLP
            let FP = 1.;
            let MAX_ITER = 20;
            function iterate_piping_coef_g({Ci, iterations}) {
                let loss = loss_coefficient_piping(d, D1, D2);
                let FP = 1.0/Math.sqrt(1. + loss/N2*(Ci/d**2)**2);
                let loss_upstream = loss_coefficient_piping(d, D1);
                let xTP = xT/FP**2/(1 + xT*loss_upstream/N5*(Ci/d**2)**2);
                let choked = is_choked_turbulent_g(x, Fgamma, { xTP: xTP });
                if( choked ) {
                    // Choked flow with piping, equation 17a
                    let C = Q/(N9*FP*P1*Y)*Math.sqrt(MW*T*Z/xTP/Fgamma);
                } else {
                    // Non-choked flow with piping, equation 11a
                    C = Q/(N9*FP*P1*Y)*Math.sqrt(MW*T*Z/x);
                }
                if( Ci/C < 0.99 && iterations < MAX_ITER && Ci < MAX_C_POSSIBLE ) {
                    C = iterate_piping_coef_g(C, iterations+1);
                }
                if( full_output ) {  // numba: delete
                    ans['xTP'] = xTP;  // numba: delete
                    ans['FP'] = FP;  // numba: delete
                    ans['choked'] = choked;  // numba: delete
                    if( MAX_ITER === iterations || Ci >= MAX_C_POSSIBLE ) {  // numba: delete
                        ans['warning'] = 'Not converged in inner loop';  // numba: delete
                    }
                }
                return C;
            }

            //def err_piping_coeff(Ci):
            //    loss = loss_coefficient_piping(d, D1, D2)
            //    FP = (1. + loss/N2*(Ci/d**2)**2)**-0.5
            //    loss_upstream = loss_coefficient_piping(d, D1)
            //    xTP = xT/FP**2/(1 + xT*loss_upstream/N5*(Ci/d**2)**2)
            //    choked = is_choked_turbulent_g(x, Fgamma, xTP=xTP)
            //    if choked:
            //        // Choked flow with piping, equation 17a
            //        C = Q/(N9*FP*P1*Y)*(MW*T*Z/xTP/Fgamma)**0.5
            //    else:
            //        // Non-choked flow with piping, equation 11a
            //        C = Q/(N9*FP*P1*Y)*(MW*T*Z/x)**0.5
            //    return C - Ci
            //import matplotlib.pyplot as plt
            //from fluids.numerics import linspace
            //Cs = linspace(C/50, C*50, 5000)
            //errs = [err_piping_coeff(C_test) for C_test in Cs]
            //plt.plot(Cs, errs)
            //plt.show()

            C = iterate_piping_coef_g(C, 0);
        } else if( Rev <= 10000 && allow_laminar ) {
            // Laminar;
                        function iterate_piping_laminar_g(C) {
                let Ci = 1.3*C;
                let Rev = Reynolds_valve( {nu: nu, Q: Q, D1: D1, FL: FL, Fd: Fd, C: Ci });
                if( Ci/d**2 > 0.016*N18 ) {
                    let FR = Reynolds_factor( {FL: FL, C: Ci, d: d, Rev: Rev, full_trim: false });
                } else {
                    let FR = Reynolds_factor( {FL: FL, C: Ci, d: d, Rev: Rev, full_trim: true });
                }
                if( C/FR >= Ci ) {
                    let Ci = iterate_piping_laminar_g(Ci);
                }
                if( full_output ) {  // numba: delete
                    ans['FR'] = FR;  // numba: delete
                    ans['Rev'] = Rev;  // numba: delete
                }
                return Ci;
            }
            C = iterate_piping_laminar_g(C);
}
    }
    if( full_output ) {  // numba: delete
        ans['Kv'] = C;  // numba: delete
        ans['laminar'] = Rev <= 10000;  // numba: delete
        ans['choked'] = choked; // numba: delete
        return ans; // numba: delete
    }
    return C;
}


// Valve data from Emerson Valve Handbook 5E
// Quick opening valve data, spline fit, and interpolating function
let opening_quick = [0.0, 0.0136, 0.02184, 0.03256, 0.04575, 0.06221, 0.07459, 0.0878, 0.10757, 0.12654, 0.14301, 0.16032, 0.18009, 0.18999, 0.20233, 0.23105, 0.25483, 0.28925, 0.32365, 0.36541, 0.42188, 0.46608, 0.53319, 0.61501, 0.7034, 0.78033, 0.84415, 0.91944, 1.000];
let frac_CV_quick = [0.0, 0.04984, 0.07582, 0.12044, 0.16614, 0.21707, 0.26998, 0.32808, 0.39353, 0.46516, 0.52125, 0.58356, 0.64798, 0.68845, 0.72277, 0.76565, 0.79399, 0.82459, 0.84589, 0.86732, 0.88078, 0.89399, 0.90867, 0.92053, 0.93973, 0.95872, 0.96817, 0.98611, 1.0];
let opening_quick_tck = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.0, 0.02184, 0.03256, 0.04575, 0.06221, 0.07459, 0.0878, 0.10757, 0.12654, 0.14301, 0.16032, 0.18009, 0.18999, 0.20233, 0.23105, 0.25483, 0.28925, 0.32365, 0.36541, 0.42188, 0.46608, 0.53319, 0.61501, 0.7034, 0.78033, 0.84415, 1.0, 1.0, 1.0, 1.0], [-3.2479258181113327e-19, 0.037650956835178835, 0.054616164261637117, 0.12657862552611354, 0.17115105822542115, 0.2075233903194021, 0.27084055195333684, 0.34208963001568016, 0.38730839943796663, 0.4656002247400036, 0.5196995880922897, 0.5907033063634928, 0.6304293931726886, 0.6953064258075168, 0.7382935002453699, 0.7631579537132379, 0.7997961180795559, 0.8262370617883222, 0.8471954722933543, 0.873096858463145, 0.8776128736976467, 0.897647305294458, 0.9105672165523071, 0.9192771703370824, 0.9377349743236904, 0.9603716623033031, 0.9688863605959851, 0.9980062718267431, 1.0, 0.0, 0.0, 0.0, 0.0], 3]);
export let Cv_char_quick_opening = (opening) => float(splev(opening, opening_quick_tck));

let opening_linear = [0., 1.0];
let frac_CV_linear = [0, 1];
export let Cv_char_linear = (opening) => interp(opening, opening_linear, frac_CV_linear);

// Equal opening valve data, spline fit, and interpolating function
let opening_equal = [0.0, 0.05523, 0.09287, 0.15341, 0.18942, 0.22379, 0.25816, 0.29582, 0.33348, 0.34985, 0.3826, 0.45794, 0.49235, 0.51365, 0.54479, 0.57594, 0.60218, 0.62843, 0.77628, 0.796, 0.83298, 0.86995, 0.90936, 0.95368, 1.00];
let frac_CV_equal = [0.0, 0.00845, 0.01339, 0.01877, 0.02579, 0.0349, 0.04189, 0.05528, 0.07079, 0.07533, 0.09074, 0.13444, 0.15833, 0.17353, 0.20159, 0.23388, 0.26819, 0.30461, 0.60113, 0.64588, 0.72583, 0.80788, 0.87519, 0.94999, 1.];
let opening_equal_tck = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.0, 0.09287, 0.15341, 0.18942, 0.22379, 0.25816, 0.29582, 0.33348, 0.34985, 0.3826, 0.45794, 0.49235, 0.51365, 0.54479, 0.57594, 0.60218, 0.62843, 0.77628, 0.796, 0.83298, 0.86995, 0.90936, 1.0, 1.0, 1.0, 1.0],
                                                 [1.3522591106779132e-19, 0.004087873896711868, 0.014374150571122216, 0.016455484312674015, 0.024946845435605228, 0.03592972456181881, 0.040710119644626126, 0.054518468768197687, 0.06976905178508139, 0.07587146190282387, 0.0985485829020452, 0.1238160142641967, 0.15558350087382017, 0.17487348629353283, 0.20157507610951217, 0.22995771158118564, 0.2683886931491415, 0.3574766835730407, 0.5027678906008036, 0.659729970241158, 0.7233389559355903, 0.8155475382785987, 0.8983628328699896, 0.9871204658597236, 1.0, 0.0, 0.0, 0.0, 0.0], 3]);
export let Cv_char_equal_percentage = (opening) => float(splev(opening, opening_equal_tck));
export function convert_flow_coefficient({flow_coefficient, old_scale, new_scale}) {
    /*Convert from one flow coefficient scale to another; supports the `Kv`
    `Cv`, and `Av` scales.

    Other scales are `Qn` and `Cg`, but clear definitions have yet to be
    found.

    Parameters
    ----------
    flow_coefficient : float
        Value of the flow coefficient to be converted, expressed in the
        original scale.
    old_scale : str
        String specifying the original scale; one of 'Av', 'Cv', or 'Kv', [-]
    new_scale : str
        String specifying the new scale; one of 'Av', 'Cv', or 'Kv', [-]

    Returns
    -------
    converted_flow_coefficient : float
        Flow coefficient converted to the specified scale.

    Notes
    -----
    `Qn` is a scale based on a flow of air in units of L/minute as air travels
    through a valve and loses one bar of pressure (initially 7 bar absolute,
    to 6 bar absolute). No consistent conversion factors have been found and
    those from theory do not match what have been found. Some uses of `Qn` use
    its flow rate as in normal (STP reference conditions) flow rate of air;
    others use something like the 7 bar absolute condition.

    Examples
    --------
    >>> convert_flow_coefficient(10, 'Kv', 'Av')
    0.0002776532068951358
    */
    // Convert from `old_scale` to Kv
    if( old_scale === 'Cv' ) {
        let Kv = Cv_to_Kv(flow_coefficient);
    } else if( old_scale === 'Kv' ) {
        Kv = flow_coefficient;
    } else if( old_scale === 'Av' ) {
        let Cv = flow_coefficient/(Math.sqrt(rho0/psi)*gallon/minute);
        Kv = Cv_to_Kv(Cv);
    } else {
        throw new Error( 'NotImplementedError',"Supported scales are 'Cv', 'Kv', and 'Av'" );
    }

    if( new_scale === 'Cv' ) {
        let ans = Kv_to_Cv(Kv);
    } else if( new_scale === 'Kv' ) {
        ans = Kv;
    } else if( new_scale === 'Av' ) {
        Cv = Kv_to_Cv(Kv);
        ans = Cv*(Math.sqrt(rho0/psi)*gallon/minute);
    } else {
        throw new Error( 'NotImplementedError',"Supported scales are 'Cv', 'Kv', and 'Av'" );
    }
    return ans;
}


// Third octave center frequency fi Hz
let fis_l_2015 = [12.5, 16.0, 20.0, 25.0, 31.5, 40.0, 50.0, 63.0, 80.0, 100.0, 125.0, 160.0, 200.0, 250.0, 315.0, 400.0, 500.0, 630.0, 800.0, 1000.0, 1250.0, 1600.0, 2000.0, 2500.0, 3150.0, 4000.0, 5000.0, 6300.0, 8000.0, 10000.0, 12500.0, 16000.0, 20000.0];
//fis_l_2015_inv = [1.0/fi for fi in fis_l_2015]
//fis_l_2015_1_5 = [fi**1.5 for fi in fis_l_2015]
//fis_l_2015_n1_5 = [fi**-1.5 for fi in fis_l_2015]

let fis_l_2015_inv = [0.08, 0.0625, 0.049999999999999996, 0.04000000000000001, 0.031746031746031744, 0.025, 0.02, 0.01587301587301587, 0.012499999999999999, 0.010000000000000002, 0.008, 0.00625, 0.005, 0.003999999999999999, 0.003174603174603174, 0.0025000000000000005, 0.002, 0.0015873015873015873, 0.00125, 0.0009999999999999998, 0.0008, 0.0006250000000000001, 0.0005, 0.0004, 0.0003174603174603174, 0.00024999999999999995, 0.0002, 0.00015873015873015873, 0.000125, 0.0001, 8e-05, 6.249999999999999e-05, 5e-05];
let fis_l_2015_1_5 = [44.19417382415922, 64.0, 89.44271909999159, 125.0, 176.79331152506873, 252.98221281347034, 353.5533905932738, 500.04699779120756, 715.5417527999327, 1000.0, 1397.5424859373686, 2023.8577025077627, 2828.42712474619, 3952.847075210474, 5590.695395029137, 8000.0, 11180.339887498949, 15812.874501494027, 22627.41699796952, 31622.776601683792, 44194.17382415922, 64000.0, 89442.71909999159, 125000.0, 176793.3115250687, 252982.21281347034, 353553.39059327374, 500046.9977912076, 715541.7527999327, 1000000.0, 1397542.4859373686, 2023857.7025077627, 2828427.12474619];
let fis_l_2015_n1_5 = [0.02262741699796952, 0.015625, 0.011180339887498947, 0.008000000000000002, 0.00565632258015713, 0.003952847075210475, 0.00282842712474619, 0.001999812026503847, 0.0013975424859373684, 0.0010000000000000002, 0.0007155417527999327, 0.0004941058844013093, 0.00035355339059327376, 0.0002529822128134703, 0.00017886862533936855, 0.00012500000000000003, 8.944271909999159e-05, 6.323960895949173e-05, 4.419417382415922e-05, 3.162277660168379e-05, 2.2627416997969522e-05, 1.5625000000000004e-05, 1.1180339887498949e-05, 8.000000000000001e-06, 5.6563225801571285e-06, 3.9528470752104736e-06, 2.8284271247461903e-06, 1.9998120265038475e-06, 1.3975424859373686e-06, 1.0000000000000002e-06, 7.155417527999328e-07, 4.941058844013092e-07, 3.535533905932738e-07];
let fis_l_2015_3 = [1953.125, 4096.0, 8000.0, 15625.0, 31255.875, 64000.0, 125000.0, 250047.0, 512000.0, 1000000.0, 1953125.0, 4096000.0, 8000000.0, 15625000.0, 31255875.0, 64000000.0, 125000000.0, 250047000.0, 512000000.0, 1000000000.0, 1953125000.0, 4096000000.0, 8000000000.0, 15625000000.0, 31255875000.0, 64000000000.0, 125000000000.0, 250047000000.0, 512000000000.0, 1000000000000.0, 1953125000000.0, 4096000000000.0, 8000000000000.0];
let fis_l_2015_17 = [73.2397784872531, 111.43047210190387, 162.83621261476173, 237.95674233948478, 352.4746934040807, 529.0564156396547, 773.1237367774792, 1145.1936574895758, 1718.9093656438004, 2511.88643150958, 3670.6841971500585, 5584.753005453414, 8161.143093473476, 11926.088141608398, 17665.581651081215, 26515.632138719888, 38747.97468870842, 57395.64411646984, 86149.54298230256, 125892.54117941669, 183970.00582889825, 279900.6909294791, 409026.07302542904, 597720.3123687729, 885376.3998122095, 1328929.6319483411, 1941999.0242893337, 2876596.4096988947, 4317705.1125554005, 6309573.44480193, 9220341.829177868, 14028265.297730776, 20499864.602104142];

//fis_l_2015_inv, fis_l_2015_1_5, fis_l_2015_17, fis_l_2015_n1_5, fis_l_2015_3 = [], [], [], [], []
//for fi in fis_l_2015:
//    fi_rt_inv = 1.0/Math.sqrt(fi)
//    fis_l_2015_inv.append(fi_rt_inv*fi_rt_inv)
//    fis_l_2015_1_5.append(fi*fi*fi_rt_inv)
//    fis_l_2015_n1_5.append(fi_rt_inv*fi_rt_inv*fi_rt_inv)
//    fis_l_2015_3.append(fi*fi*fi)
//    fis_l_2015_17.append(fi**1.7)


let fis_length = 33;

// dLa(fi), dB
let A_weights_l_2015 = [-63.4, -56.7, -50.5, -44.7, -39.4, -34.6, -30.2, -26.2, -22.5, -19.1, -16.1, -13.4, -10.9, -8.6, -6.6, -4.8, -3.2, -1.9, -0.8, 0.0, 0.6, 1.0, 1.2, 1.3, 1.2, 1.0, 0.5, -0.1, -1.1, -2.5, -4.3, -6.6, -9.3];
export function control_valve_noise_l_2015({m, P1, P2, Psat, rho, c, Kv, d, Di, FL, Fd,
                               t_pipe, rho_pipe=7800.0, c_pipe=5000.0,
                               rho_air=1.2, c_air=343.0, xFz=null, An=-4.6}) {
    // Convert Kv to Cv as C
    let N34 = 1.17; // for Cv - conversion constant but not to many decimals
    let N14 = 0.0046;

    let C = Kv_to_Cv(Kv);
    let xF = (P1-P2)/(P1-Psat);
    let dPc = min(P1-P2, FL*FL*(P1 - Psat));

    if( xFz === null ) {
        let xFz = 0.9*1.0/Math.sqrt(1.0 + 3.0*Fd*Math.sqrt(C/(N34*FL)));
    }
    let xFzp1 = xFz*Math.sqrt(Math.sqrt(Math.sqrt((6E5/P1))));

    let Dj = N14*Fd*Math.sqrt(C*FL);

    let Uvc = Math.sqrt(2.0*dPc/rho)/FL;
    let Wm = 0.5*m*Uvc*Uvc*FL*FL;
    let cavitating = xF > xFzp1;

    let eta_turb = 10.0**An*Uvc/c;

    let x0 = xF - xFzp1;
    let x1 = xF/xFzp1;
    let x2 = x1*x1;
    x1 = x2*x2*x1;

    if( cavitating ) {
    	let eta_cav = 0.32*eta_turb*Math.sqrt((P1 - P2)/(dPc*xFzp1))*Math.exp(5.0*xFzp1)*Math.sqrt((1.0
                             - xFzp1)/(1.0 - xF))*(x1)*x0*Math.sqrt(x0);
    	let Wa = (eta_turb+eta_cav)*Wm;
    } else {
    	Wa = eta_turb*Wm;
    }

    let Lpi = 10.0*Math.log10(3.2E9*Wa*rho*c/(Di*Di));
    let Stp = 0.036*FL*FL*C*Fd**0.75/(N34*xFzp1*Math.sqrt(xFzp1)*d*d)*(1.0/(P1 - Psat))**0.57;
    let f_p_turb = Stp*Uvc/Dj;

    if( cavitating ) {
        let x3 = ((1.0 - xF)/(1.0 - xFzp1));
        let x4 = xFzp1/xF;
        let f_p_cav = 6.0*f_p_turb*x3*x3*x4*x4*Math.sqrt(x4);
        let f_p_cav_inv = 1.0/f_p_cav;
        let f_p_cav_inv_1_5 = f_p_cav_inv*Math.sqrt(f_p_cav_inv);
        let f_p_cav_inv_1_5_1_4 = 0.25*f_p_cav_inv_1_5;
        let f_p_cav_1_5 = 1.0/f_p_cav_inv_1_5;
        let eta_denom = 1.0/(eta_turb + eta_cav);
        let t1 = eta_turb*eta_denom;
        let t2 = eta_cav*eta_denom;
    }
    let fr = c_pipe/(Math.PI*Di);
    let fr_inv = 1.0/fr;
    let TL_fr = -10.0 - 10.0*Math.log10(c_pipe*rho_pipe*t_pipe/(c_air*rho_air*Di));

    let t3 = - 10.0*Math.log10((Di + 2.0*t_pipe + 2.0)/(Di + 2.0*t_pipe));

//    F_cavs = []
//    F_turbs = []
//    LPis = []
//    TL_fis = []
//    L_pe1m_fis = []
    let LpAe1m_sum = 0.0;

    let f_p_turb_inv = 1.0/f_p_turb;
    let f_p_turb_inv3 = f_p_turb_inv*f_p_turb_inv*f_p_turb_inv;

    let fr_inv_1_5 = fr_inv*Math.sqrt(fr_inv);


    for( let i of range(fis_length) ) {
    //for fi, fi_inv, fi_1_5, fi_1_5_inv, A in zip(fis_l_2015, fis_l_2015_inv, fis_l_2015_1_5, fis_l_2015_n1_5, A_weights_l_2015):
    //    fi_inv = 1.0/fi
    //    fi_turb_ratio = fis_l_2015[i]*f_p_turb_inv
    //    fi_turb_ratio = fi*f_p_turb_inv
        let F_turb = -.8 - Math.log10(0.25*f_p_turb_inv3*fis_l_2015_3[i]
                                   + fis_l_2015_inv[i]*f_p_turb);
        //F_turbs.append(F_turb)
        if( cavitating ) {
            //fi_cav_ratio = fi_1_5*f_p_cav_inv_1_5#   (fi*f_p_cav_inv)**1.5
            //F_cav = -.9 - Math.log10(f_p_cav_inv_1_5_1_4*fis_l_2015_1_5[i] + fis_l_2015_n1_5[i]*f_p_cav_1_5) // 1.0/fi_cav_ratio, fi_1_5_inv*f_p_cav_1_5
            let F_cav_fact = 0.12589254117941673/(f_p_cav_inv_1_5_1_4*fis_l_2015_1_5[i] + fis_l_2015_n1_5[i]*f_p_cav_1_5);
            // 0.1258925411794167310 = 10**(-0.9)

            // 4.3429448190325175*Math.log(x) -> 10*Math.log10(x)
            let LPif = (Lpi + 4.3429448190325175*Math.log(t1*10.0**(F_turb) + t2*F_cav_fact));
        } else {
            let LPif = Lpi + F_turb*10.0;
        }
        //LPis.append(LPif)
        // -8.685889638065035 = -20*Math.log10(x)
        let TL_fi = TL_fr - 8.685889638065035*Math.log(fr*fis_l_2015_inv[i] + fis_l_2015_1_5[i]*fr_inv_1_5); //  (fi*fr_inv)**1.5
        //TL_fis.append(TL_fi)
        let L_pe1m_fi = LPif + TL_fi + t3;
        //L_pe1m_fis.append(L_pe1m_fi)
        LpAe1m_sum += Math.exp(0.23025850929940458*(L_pe1m_fi + A_weights_l_2015[i]));
    }
    let LpAe1m = 4.3429448190325175*Math.log(LpAe1m_sum);
    return LpAe1m;
}


export function control_valve_noise_g_2011({m, P1, P2, T1, rho, gamma, MW, Kv,
                               d, Di, t_pipe, Fd, FL, FLP=null, FP=null,
                               rho_pipe=7800.0, c_pipe=5000.0,
                               P_air=101325.0, rho_air=1.2, c_air=343.0,
                               An=-3.8, Stp=0.2, T2=null, beta=0.93}) {
    let k = gamma; // alias
    let C = Kv_to_Cv(Kv);
    let N14 = 4.6E-3;
    let N16 = 4.89E4;
    let fs = 1.0; // structural loss factor reference frequency, Hz
    let P_air_std = 101325.0;
    if( T2 === null ) {
        let T2 = T1;
    }
    let x = (P1 - P2)/P1;


    // FLP/FP when fittings attached
    let FL_term = FP !== null ? FLP/FP : FL;

    let P_vc = P1*(1.0 - x/FL_term**2);

    let x_vcc = 1.0 - (2.0/(k + 1.0))**(k/(k - 1.0)); // mostly matches
    let xc = FL_term**2*x_vcc;
    let alpha = (1.0 - x_vcc)/(1.0 - xc);
    let xB = 1.0 - 1.0/alpha*(1.0/k)**((k/(k - 1.0)));
    let xCE = 1.0 - 1.0/(22.0*alpha);

    // Regime determination check - should be ordered or won't work
    //assert xc < x_vcc
    //assert x_vcc < xB
    //assert xB < xCE
    if( x <= xc ) {
        let regime = 1;
    } else if( xc < x <= x_vcc ) {
        regime = 2;
    } else if( x_vcc < x <= xB ) {
        regime = 3;
    } else if( xB < x <= xCE ) {
        regime = 4;
    } else {
        regime = 5;
    }
    //print('regime', regime)

    let Dj = N14*Fd*Math.sqrt(C*(FL_term));

    let Mj5 = Math.sqrt(2.0/(k - 1.0)*( 22.0**((k-1.0)/k) - 1.0  ));
    if( regime === 1 ) {
        let Mvc = Math.sqrt((2.0/(k-1.0)) *((1.0 - x/FL_term**2)**((1.0 - k)/k)   - 1.0)); // Not match
    } else if( regime === 2 || regime === 3 || regime === 4 ) {
        let Mj = Math.sqrt((2.0/(k-1.0))*((1.0/(alpha*(1.0-x)))**((k - 1.0)/k) - 1.0)); // Not match
        Mj = min(Mj, Mj5);
}
    //elif regime == 5:
    //    pass

    if( regime === 1 ) {
        let Tvc = T1*(1.0 - x/(FL_term)**2)**((k - 1.0)/k);
        let cvc = Math.sqrt(k*P1/rho*(1 - x/(FL_term)**2)**((k-1.0)/k));
        let Wm = 0.5*m*(Mvc*cvc)**2;
    } else {
        let Tvcc = 2.0*T1/(k + 1.0);
        let cvcc = Math.sqrt(2.0*k*P1/(k+1.0)/rho);
        Wm = 0.5*m*cvcc*cvcc;
    }
    // print('Wm', Wm)

    if( regime === 1 ) {
        let fp = Stp*Mvc*cvc/Dj;
    } else if( regime === 2 || regime === 3 ) {
        fp = Stp*Mj*cvcc/Dj;
    } else if( regime === 4 ) {
        fp = 1.4*Stp*cvcc/Dj/Math.sqrt(Mj*Mj - 1.0);
    } else if( regime === 5 ) {
        fp = 1.4*Stp*cvcc/Dj/Math.sqrt(Mj5*Mj5 - 1.0);
}
    let fp_inv = 1.0/fp;
//     print('fp', fp)

    if( regime === 1 ) {
        let eta = 10.0**An*FL_term**2*(Mvc)**3;
    } else if( regime === 2 ) {
        eta = 10.0**An*x/x_vcc*Mj**(6.6*FL_term*FL_term);
    } else if( regime === 3 ) {
        eta = 10.0**An*Mj**(6.6*FL_term*FL_term);
    } else if( regime === 4 ) {
        eta = 0.5*10.0**An*Mj*Mj*(Math.sqrt(2.0))**(6.6*FL_term*FL_term);
    } else if( regime === 5 ) {
        eta = 0.5*10.0**An*Mj5*Mj5*(Math.sqrt(2.0))**(6.6*FL_term*FL_term);
}
//     print('eta', eta)

    let Wa = eta*Wm;

    let rho2 = rho*(P2/P1);
    // Speed of sound
    let c2 = Math.sqrt(k*R*T2/(MW/1000.));

    let Mo = 4.0*m/(Math.PI*d*d*rho2*c2);

    let M2 = 4.0*m/(Math.PI*Di*Di*rho2*c2);
//     print('M2', M2)

    let Lg = 16.0*Math.log10(1.0/(1.0 - min(M2, 0.3))); // dB

    if( M2 > 0.3 ) {
        let Up = 4.0*m/(Math.PI*rho2*Di*Di);
        let UR = Up*Di*Di/(beta*d*d);
        let WmR = 0.5*m*UR*UR*( (1.0 - d*d/(Di*Di))**2 + 0.2);
        let fpR = Stp*UR/d;
        let MR = UR/c2;
        // Value listed in appendix here is wrong, "based on another
        // earlier standard. Calculation thereon is wrong". Assumed
        // correct, matches spreadsheet to three decimals.
        let eta_R = 10**An*MR**3;
        let WaR = eta_R*WmR;
        let L_piR = 10.0*Math.log10((3.2E9)*WaR*rho2*c2/(Di*Di)) + Lg;
    }
    let L_pi = 10.0*Math.log10((3.2E9)*Wa*rho2*c2/(Di*Di)) + Lg;
//     print('L_pi', L_pi)

    let fr = c_pipe/(Math.PI*Di);
    let fo = 0.25*fr*(c2/c_air);
    let fg = Math.sqrt(3)*c_air**2/(Math.PI*t_pipe*c_pipe);

    if( d > 0.15 ) {
        let dTL = 0.0;
    } else if( 0.05 <= d <= 0.15 ) {
        dTL = -16660.0*d**3 + 6370.0*d**2 - 813.0*d + 35.8;
    } else {
        dTL = 9.0;
    }
//     print(dTL, 'dTL')

    let P_air_ratio = P_air/P_air_std;

    let LpAe1m_sum = 0.0;
//    LPis = []
//    LPIRs = []
//    L_pe1m_fis = []
    for( let [ fi, A_weight ] of _pyjs.listZip(fis_l_2015, A_weights_l_2015) ) {
        // This gets adjusted when Ma > 0.3
        let fi_turb_ratio = fi*fp_inv;

        let t1 = 1.0 + (0.5*fi_turb_ratio)**2.5;
        let t2 = 1.0 + (0.5/fi_turb_ratio)**1.7;

        // Formula forgot to use Math.log10, but Math.log10 is needed for the numbers
        let Lpif = L_pi - 8.0 - 10.0*Math.log10(t1*t2);
//         print(Lpif, 'Lpif')
//        LPis.append(Lpif)

        if( M2 > 0.3 ) {
            let fiR_turb_ratio = fi/fpR;
            t1 = 1.0 + (0.5*fiR_turb_ratio)**2.5;
            t2 = 1.0 + (0.5/fiR_turb_ratio)**1.7;
            // Again, Math.log10 is missing
            let LpiRf = L_piR - 8.0 - 10.0*Math.log10(t1*t2);
//            LPIRs.append(LpiRf)

            let LpiSf = 10.0*Math.log10( 10**(0.1*Lpif) + 10.0**(0.1*LpiRf) );
        }
        if( fi < fo ) {
            let Gx = (fo/fr)**(2.0/3.0)*(fi/fo)**4.0;
            if( fo < fg ) {
                let Gy = (fo/fg);
            } else {
                Gy = 1.0;
            }
        } else {
            if( fi < fr ) {
                Gx = Math.sqrt(fi/fr);
            } else {
                Gx = 1.0;
            }
            if( fi < fg ) {
                Gy = fi/fg;
            } else {
                Gy = 1.0;
            }

        }
        let eta_s = Math.sqrt(0.01/fi);
//         print('eta_s', eta_s)
        // up to eta_s is good

        let den = (rho2*c2 + 2.0*Math.PI*t_pipe*fi*rho_pipe*eta_s)/(415.0*Gy) + 1.0;
        let TL_fi = 10.0*Math.log10(8.25E-7*(c2/(t_pipe*fi))**2*Gx/den*P_air_ratio) - dTL;

        // Formula forgot to use Math.log10, but Math.log10 is needed for the numbers
        if( M2 > 0.3 ) {
            let term = LpiSf;
        } else {
            term = Lpif;
        }

        let L_pe1m_fi = term + TL_fi - 10.0*Math.log10((Di + 2.0*t_pipe + 2.0)/(Di + 2.0*t_pipe));
//        L_pe1m_fis.append(L_pe1m_fi)
//         print(L_pe1m_fi)

        LpAe1m_sum += 10.0**(0.1*(L_pe1m_fi + A_weight));
    }
    let LpAe1m = 10.0*Math.log10(LpAe1m_sum);
    return LpAe1m;
}



