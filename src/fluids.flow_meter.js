import { radians } from './fluids.helpers.js' ;
import { friction_factor } from './fluids.friction.js' ;
import { Froude_densimetric } from './fluids.core.js' ;
import { interp, secant, brenth, NotBoundedError, implementation_optimize_tck, bisplev } from './fluids.numerics_init.js' ;
import { g, inch, inch_inv, pi_inv, root_two } from './fluids.constants.js' ;
let __all__ = ['C_Reader_Harris_Gallagher', 'differential_pressure_meter_solver', 'differential_pressure_meter_dP', 'flow_meter_discharge', 'orifice_expansibility', 'discharge_coefficient_to_K', 'K_to_discharge_coefficient', 'dP_orifice', 'velocity_of_approach_factor', 'flow_coefficient', 'nozzle_expansibility', 'C_long_radius_nozzle', 'C_ISA_1932_nozzle', 'C_venturi_nozzle', 'orifice_expansibility_1989', 'dP_venturi_tube', 'diameter_ratio_cone_meter', 'diameter_ratio_wedge_meter', 'cone_meter_expansibility_Stewart', 'dP_cone_meter', 'C_wedge_meter_Miller', 'C_wedge_meter_ISO_5167_6_2017', 'dP_wedge_meter', 'C_Reader_Harris_Gallagher_wet_venturi_tube', 'dP_Reader_Harris_Gallagher_wet_venturi_tube', 'differential_pressure_meter_C_epsilon', 'differential_pressure_meter_beta', 'C_eccentric_orifice_ISO_15377_1998', 'C_quarter_circle_orifice_ISO_15377_1998', 'C_Miller_1996', 'all_meters', ];
let CONCENTRIC_ORIFICE = 'orifice'; // normal
let ECCENTRIC_ORIFICE = 'eccentric orifice';
let CONICAL_ORIFICE = 'conical orifice';
let SEGMENTAL_ORIFICE = 'segmental orifice';
let QUARTER_CIRCLE_ORIFICE = 'quarter circle orifice';
let CONDITIONING_4_HOLE_ORIFICE = 'Rosemount 4 hole self conditioing';
let ORIFICE_HOLE_TYPES = [CONCENTRIC_ORIFICE, ECCENTRIC_ORIFICE, CONICAL_ORIFICE, SEGMENTAL_ORIFICE, QUARTER_CIRCLE_ORIFICE];
let ORIFICE_CORNER_TAPS = 'corner';
let ORIFICE_FLANGE_TAPS = 'flange';
let ORIFICE_D_AND_D_2_TAPS = 'D and D/2';
let ORIFICE_PIPE_TAPS = 'pipe'; // Not in ISO 5167
let ORIFICE_VENA_CONTRACTA_TAPS = 'vena contracta'; // Not in ISO 5167, normally segmental or eccentric orifices
// Used by miller; modifier on taps
let TAPS_OPPOSITE = '180 degree';
let TAPS_SIDE = '90 degree';
let ISO_5167_ORIFICE = 'ISO 5167 orifice';
let ISO_15377_ECCENTRIC_ORIFICE = 'ISO 15377 eccentric orifice';
let ISO_15377_QUARTER_CIRCLE_ORIFICE = 'ISO 15377 quarter-circle orifice';
let ISO_15377_CONICAL_ORIFICE = 'ISO 15377 conical orifice';
let MILLER_ORIFICE = 'Miller orifice';
let MILLER_ECCENTRIC_ORIFICE = 'Miller eccentric orifice';
let MILLER_SEGMENTAL_ORIFICE = 'Miller segmental orifice';
let MILLER_CONICAL_ORIFICE = 'Miller conical orifice';
let MILLER_QUARTER_CIRCLE_ORIFICE = 'Miller quarter circle orifice';
let UNSPECIFIED_METER = 'unspecified meter';
let LONG_RADIUS_NOZZLE = 'long radius nozzle';
let ISA_1932_NOZZLE = 'ISA 1932 nozzle';
let VENTURI_NOZZLE = 'venuri nozzle';
let AS_CAST_VENTURI_TUBE = 'as cast convergent venturi tube';
export let MACHINED_CONVERGENT_VENTURI_TUBE = 'machined convergent venturi tube';
let ROUGH_WELDED_CONVERGENT_VENTURI_TUBE = 'rough welded convergent venturi tube';
let HOLLINGSHEAD_ORIFICE = 'Hollingshead orifice';
let HOLLINGSHEAD_VENTURI_SMOOTH = 'Hollingshead venturi smooth';
let HOLLINGSHEAD_VENTURI_SHARP = 'Hollingshead venturi sharp';
let HOLLINGSHEAD_CONE = 'Hollingshead v cone';
let HOLLINGSHEAD_WEDGE = 'Hollingshead wedge';
let CONE_METER = 'cone meter';
let WEDGE_METER = 'wedge meter';
__all__ = __all__.concat(['ISO_5167_ORIFICE','ISO_15377_ECCENTRIC_ORIFICE', 'MILLER_ORIFICE', 'MILLER_ECCENTRIC_ORIFICE', 'MILLER_SEGMENTAL_ORIFICE', 'LONG_RADIUS_NOZZLE', 'ISA_1932_NOZZLE', 'VENTURI_NOZZLE', 'AS_CAST_VENTURI_TUBE', 'MACHINED_CONVERGENT_VENTURI_TUBE', 'ROUGH_WELDED_CONVERGENT_VENTURI_TUBE', 'CONE_METER', 'WEDGE_METER', 'ISO_15377_CONICAL_ORIFICE', 'MILLER_CONICAL_ORIFICE', 'MILLER_QUARTER_CIRCLE_ORIFICE', 'ISO_15377_QUARTER_CIRCLE_ORIFICE', 'UNSPECIFIED_METER', 'HOLLINGSHEAD_ORIFICE', 'HOLLINGSHEAD_CONE', 'HOLLINGSHEAD_WEDGE', 'HOLLINGSHEAD_VENTURI_SMOOTH', 'HOLLINGSHEAD_VENTURI_SHARP']);
__all__ = __all__.concat(['ORIFICE_CORNER_TAPS', 'ORIFICE_FLANGE_TAPS', 'ORIFICE_D_AND_D_2_TAPS', 'ORIFICE_PIPE_TAPS', 'ORIFICE_VENA_CONTRACTA_TAPS', 'TAPS_OPPOSITE', 'TAPS_SIDE']);
__all__ = __all__.concat(['CONCENTRIC_ORIFICE', 'ECCENTRIC_ORIFICE', 'CONICAL_ORIFICE', 'SEGMENTAL_ORIFICE', 'QUARTER_CIRCLE_ORIFICE']);
export function flow_meter_discharge({D, Do, P1, P2, rho, C, expansibility=1.0}) {
    let beta = Do/D;
    let beta2 = beta*beta;
    return (0.25*Math.PI*Do*Do)*C*expansibility*Math.sqrt((2.0*rho*(P1 - P2))/(1.0 - beta2*beta2));
}
export function orifice_expansibility({D, Do, P1, P2, k}) {
    let beta = Do/D;
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    return (1.0 - (0.351 + beta4*(0.93*beta4 + 0.256))*(
            1.0 - (P2/P1)**(1./k)));
}
export function orifice_expansibility_1989({D, Do, P1, P2, k}) {
    return 1.0 - (0.41 + 0.35*(Do/D)**4)*(P1 - P2)/(k*P1);
}
export function C_Reader_Harris_Gallagher({D, Do, rho, mu, m, taps='corner'}) {
    let A_pipe = 0.25*Math.PI*D*D;
    let v = m/(A_pipe*rho);
    let Re_D = rho*v*D/mu;
    let Re_D_inv = 1.0/Re_D;
    let beta = Do/D;
    if( taps === 'corner' ) {
        let [L1, L2_prime] = [0.0, 0.0];
    } else if( taps === 'flange' ) {
        L1 = L2_prime = 0.0254/D;
    } else if( taps  === 'D' || taps === 'D/2' || taps === ORIFICE_D_AND_D_2_TAPS ) {
        L1 = 1.0;
        let L2_prime = 0.47;
    } else {
        throw new Error( 'ValueError','Unsupported tap location' );
    }
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    let beta8 = beta4*beta4;
    let A = 2648.5177066967326*(beta*Re_D_inv)**0.8; // 19000.0^0.8 = 2648.51....
    let M2_prime = 2.0*L2_prime/(1.0 - beta);
    // These two exps
    let expnL1 = Math.exp(-L1);
    let expnL2 = expnL1*expnL1;
    let expnL3 = expnL1*expnL2;
    let delta_C_upstream = ((0.043 + expnL3*expnL2*expnL2*(0.080*expnL3 - 0.123))
            *(1.0 - 0.11*A)*beta4/(1.0 - beta4));
    // The max part is not in the ISO standard
    let t1 = Math.log10(3700.*Re_D_inv);
    if( t1 < 0.0 ) {
        let t1 = 0.0;
    }
    let delta_C_downstream = (-0.031*(M2_prime - 0.8*M2_prime**1.1)*beta**1.3
                          *(1.0 + 8.0*t1));
    // C_inf is discharge coefficient with corner taps for infinite Re
    // Cs, slope term, provides increase in discharge coefficient for lower
    // Reynolds numbers.
    let x1 = 63.095734448019314*(Re_D_inv)**0.3; // 63.095... = (1e6)**0.3
    let x2 = 22.7 - 0.0047*Re_D;
    let t2 = x1 > x2 ? x1 : x2;
    // max term is not in the ISO standard
    let C_inf_C_s = (0.5961 + 0.0261*beta2 - 0.216*beta8
                 + 0.000521*(1E6*beta*Re_D_inv)**0.7
                 + (0.0188 + 0.0063*A)*beta2*beta*Math.sqrt(beta)*(
                 t2));
    let C = (C_inf_C_s + delta_C_upstream + delta_C_downstream);
    if( D < 0.07112 ) {
        // Limit is 2.8 inches, .1 inches smaller than the internal diameter of
        // a sched. 80 pipe.
        // Suggested to be required not becausue of any effect of small
        // diameters themselves, but because of edge radius differences.
        // max term is given in [4]_ Reader-Harris, Michael book
        // There is a check for t3 being negative and setting it to zero if so
        // in some sources but that only occurs when t3 is exactly the limit
        // (0.07112) so it is not needed
        let t3 = (2.8 - D*inch_inv);
        let delta_C_diameter = 0.011*(0.75 - beta)*t3;
        C += delta_C_diameter;
    }
    return C;
}
let _Miller_1996_unsupported_type = "Supported orifice types are %s" %( (CONCENTRIC_ORIFICE, SEGMENTAL_ORIFICE, ECCENTRIC_ORIFICE, CONICAL_ORIFICE, QUARTER_CIRCLE_ORIFICE));
let _Miller_1996_unsupported_tap_concentric = "Supported taps for subtype '%s' are %s" %( CONCENTRIC_ORIFICE, (ORIFICE_CORNER_TAPS, ORIFICE_FLANGE_TAPS, ORIFICE_D_AND_D_2_TAPS, ORIFICE_PIPE_TAPS));
let _Miller_1996_unsupported_tap_pos_eccentric = "Supported tap positions for subtype '%s' are %s" %( ECCENTRIC_ORIFICE, (TAPS_OPPOSITE, TAPS_SIDE));
let _Miller_1996_unsupported_tap_eccentric = "Supported taps for subtype '%s' are %s" %( ECCENTRIC_ORIFICE, (ORIFICE_FLANGE_TAPS, ORIFICE_VENA_CONTRACTA_TAPS));
let _Miller_1996_unsupported_tap_segmental = "Supported taps for subtype '%s' are %s" %( SEGMENTAL_ORIFICE, (ORIFICE_FLANGE_TAPS, ORIFICE_VENA_CONTRACTA_TAPS));
export function C_Miller_1996({D, Do, rho, mu, m, subtype='orifice',
                  taps=ORIFICE_CORNER_TAPS, tap_position=TAPS_OPPOSITE}) {
    let A_pipe = 0.25*Math.PI*D*D;
    let v = m/(A_pipe*rho);
    let Re = rho*v*D/mu;
    let D_mm = D*1000.0;
    let beta = Do/D;
    let beta3 = beta*beta*beta;
    let beta4 = beta*beta3;
    let beta8 = beta4*beta4;
    let beta21 = beta**2.1;
    if( subtype === MILLER_ORIFICE || subtype === CONCENTRIC_ORIFICE ) {
        let b = 91.706*beta**2.5;
        let n = 0.75;
        if( taps === ORIFICE_CORNER_TAPS ) {
            let C_inf = 0.5959 + 0.0312*beta21 - 0.184*beta8;
        } else if( taps === ORIFICE_FLANGE_TAPS ) {
            if( D_mm >= 58.4 ) {
                C_inf = 0.5959 + 0.0312*beta21 - 0.184*beta8 + 2.286*beta4/(D_mm*(1.0 - beta4)) - 0.856*beta3/D_mm;
            } else {
                C_inf = 0.5959 + 0.0312*beta21 - 0.184*beta8 + 0.039*beta4/(1.0 - beta4) - 0.856*beta3/D_mm;
            }
    } else if( taps === ORIFICE_D_AND_D_2_TAPS ) {
            C_inf = 0.5959 + 0.0312*beta21 - 0.184*beta8 + 0.039*beta4/(1.0 - beta4) - 0.01584;
    } else if( taps === ORIFICE_PIPE_TAPS ) {
            C_inf = 0.5959 + 0.461*beta21 + 0.48*beta8 + 0.039*beta4/(1.0 - beta4);
    } else {
            throw new Error( 'ValueError',_Miller_1996_unsupported_tap_concentric );
        }
    } else if( subtype === MILLER_ECCENTRIC_ORIFICE || subtype === ECCENTRIC_ORIFICE ) {
        if( tap_position !== TAPS_OPPOSITE && tap_position !== TAPS_SIDE ) {
            throw new Error( 'ValueError',_Miller_1996_unsupported_tap_pos_eccentric );
        }
        n = 0.75;
        if( taps === ORIFICE_FLANGE_TAPS ) {
            if( tap_position === TAPS_OPPOSITE ) {
                if( D < 0.1 ) {
                    b = 7.3 - 15.7*beta + 170.8*beta**2 - 399.7*beta3 + 332.2*beta4;
                    C_inf = 0.5917 + 0.3061*beta21 + .3406*beta8 -.1019*beta4/(1-beta4) - 0.2715*beta3;
                } else {
                    b = -139.7 + 1328.8*beta - 4228.2*beta**2 + 5691.9*beta3 - 2710.4*beta4;
                    C_inf = 0.6016 + 0.3312*beta21 - 1.5581*beta8 + 0.6510*beta4/(1-beta4) - 0.7308*beta3;
                }
            } else if( tap_position === TAPS_SIDE ) {
                if( D < 0.1 ) {
                    b = 69.1 - 469.4*beta + 1245.6*beta**2 -1287.5*beta3 + 486.2*beta4;
                    C_inf = 0.5866 + 0.3917*beta21 + 0.7586*beta8 -.2273*beta4/(1-beta4) - .3343*beta3;
                } else {
                    b = -103.2 + 898.3*beta - 2557.3*beta**2 + 2977.0*beta3 - 1131.3*beta4;
                    C_inf = 0.6037 + 0.1598*beta21 - 0.2918*beta8 + 0.0244*beta4/(1-beta4) - 0.0790*beta3;
                }
}
        } else if( taps === ORIFICE_VENA_CONTRACTA_TAPS ) {
            if( tap_position === TAPS_OPPOSITE ) {
                if( D < 0.1 ) {
                    b = 23.3 -207.0*beta + 821.5*beta**2 -1388.6*beta3 + 900.3*beta4;
                    C_inf = 0.5925 + 0.3380*beta21 + 0.4016*beta8 -.1046*beta4/(1-beta4) - 0.3212*beta3;
                } else {
                    b = 55.7 - 471.4*beta + 1721.8*beta**2 - 2722.6*beta3 + 1569.4*beta4;
                    C_inf = 0.5922 + 0.3932*beta21 + .3412*beta8 -.0569*beta4/(1-beta4) - 0.4628*beta3;
                }
            } else if( tap_position === TAPS_SIDE ) {
                if( D < 0.1 ) {
                    b = -69.3 + 556.9*beta - 1332.2*beta**2 + 1303.7*beta3 - 394.8*beta4;
                    C_inf = 0.5875 + 0.3813*beta21 + 0.6898*beta8 -0.1963*beta4/(1-beta4) - 0.3366*beta3;
                } else {
                    b = 52.8 - 434.2*beta + 1571.2*beta**2 - 2460.9*beta3 + 1420.2*beta4;
                    C_inf = 0.5949 + 0.4078*beta21 + 0.0547*beta8 +0.0955*beta4/(1-beta4) - 0.5608*beta3;
                }
}
    } else {
            throw new Error( 'ValueError',_Miller_1996_unsupported_tap_eccentric );
        }
    } else if( subtype === MILLER_SEGMENTAL_ORIFICE || subtype === SEGMENTAL_ORIFICE ) {
        n = b = 0.0;
        if( taps === ORIFICE_FLANGE_TAPS ) {
            if( D < 0.1 ) {
                C_inf = 0.6284 + 0.1462*beta21 - 0.8464*beta8 + 0.2603*beta4/(1-beta4) - 0.2886*beta3;
            } else {
                C_inf = 0.6276 + 0.0828*beta21 + 0.2739*beta8 - 0.0934*beta4/(1-beta4) - 0.1132*beta3;
            }
        } else if( taps === ORIFICE_VENA_CONTRACTA_TAPS ) {
            if( D < 0.1 ) {
                C_inf = 0.6261 + 0.1851*beta21 - 0.2879*beta8 + 0.1170*beta4/(1-beta4) - 0.2845*beta3;
            } else {
                // Yes these are supposed to be the same as the flange, large set
                C_inf = 0.6276 + 0.0828*beta21 + 0.2739*beta8 - 0.0934*beta4/(1-beta4) - 0.1132*beta3;
            }
    } else {
            throw new Error( 'ValueError',_Miller_1996_unsupported_tap_segmental );
        }
    } else if( subtype === MILLER_CONICAL_ORIFICE || subtype === CONICAL_ORIFICE ) {
        n = b = 0.0;
        if( 250.0*beta <= Re <= 500.0*beta ) {
            C_inf = 0.734;
        } else {
            C_inf = 0.730;
        }
    } else if( subtype === MILLER_QUARTER_CIRCLE_ORIFICE || subtype === QUARTER_CIRCLE_ORIFICE ) {
        n = b = 0.0;
        C_inf = (0.7746 - 0.1334*beta21 + 1.4098*beta8
                 + 0.0675*beta4/(1.0 - beta4) + 0.3865*beta3);
    } else {
        throw new Error( 'ValueError',_Miller_1996_unsupported_type );
    }
    let C = C_inf + b*Re**-n;
    return C;
}
// Data from: Discharge Coefficient Performance of Venturi, Standard Concentric Orifice Plate, V-Cone, and Wedge Flow Meters at Small Reynolds Numbers
let orifice_std_Res_Hollingshead = [1.0, 5.0, 10.0, 20.0, 30.0, 40.0, 60.0, 80.0, 100.0, 200.0, 300.0, 500.0, 1000.0, 2000.0, 3000.0, 5000.0, 10000.0, 100000.0,
    1000000.0, 10000000.0, 50000000.0
];
let orifice_std_logRes_Hollingshead = [0.0, 1.6094379124341003, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221,
    4.382026634673881, 4.605170185988092, 5.298317366548036, 5.703782474656201, 6.214608098422191, 6.907755278982137, 7.600902459542082, 8.006367567650246,
    8.517193191416238, 9.210340371976184, 11.512925464970229, 13.815510557964274, 16.11809565095832, 17.72753356339242
];
let orifice_std_betas_Hollingshead = [0.5, 0.6, 0.65, 0.7];
let orifice_std_beta_5_Hollingshead_Cs = [0.233, 0.478, 0.585, 0.654, 0.677, 0.688, 0.697, 0.700, 0.702, 0.699, 0.693, 0.684, 0.67, 0.648, 0.639, 0.632, 0.629,
    0.619, 0.615, 0.614, 0.614
];
let orifice_std_beta_6_Hollingshead_Cs = [0.212, 0.448, 0.568, 0.657, 0.689, 0.707, 0.721, 0.725, 0.727, 0.725, 0.719, 0.707, 0.688, 0.658, 0.642, 0.633, 0.624,
    0.61, 0.605, 0.602, 0.595
];
let orifice_std_beta_65_Hollingshead_Cs = [0.202, 0.425, 0.546, 0.648, 0.692, 0.715, 0.738, 0.748, 0.754, 0.764, 0.763, 0.755, 0.736, 0.685, 0.666, 0.656, 0.641,
    0.622, 0.612, 0.61, 0.607
];
let orifice_std_beta_7_Hollingshead_Cs = [0.191, 0.407, 0.532, 0.644, 0.696, 0.726, 0.756, 0.772, 0.781, 0.795, 0.796, 0.788, 0.765, 0.7, 0.67, 0.659, 0.646, 0.623,
    0.616, 0.607, 0.604
];
let orifice_std_Hollingshead_Cs = [orifice_std_beta_5_Hollingshead_Cs, orifice_std_beta_6_Hollingshead_Cs,
    orifice_std_beta_65_Hollingshead_Cs, orifice_std_beta_7_Hollingshead_Cs
];
let orifice_std_Hollingshead_tck = implementation_optimize_tck([
    [0.5, 0.5, 0.5, 0.5, 0.7, 0.7, 0.7, 0.7],
    [0.0, 0.0, 0.0, 0.0, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221, 4.382026634673881,
        4.605170185988092, 5.298317366548036, 5.703782474656201, 6.214608098422191, 6.907755278982137, 7.600902459542082, 8.006367567650246,
        8.517193191416238, 9.210340371976184, 11.512925464970229, 13.815510557964274, 17.72753356339242, 17.72753356339242, 17.72753356339242,
        17.72753356339242
    ],
    [0.23300000000000026, 0.3040793845022822, 0.5397693379388018, 0.6509414325648643, 0.6761419937262648, 0.6901697401156808, 0.6972240707909276,
        0.6996759572505151, 0.7040223363705952, 0.7008741587711967, 0.692665226515394, 0.6826387818678974, 0.6727930643166521, 0.6490542161859936,
        0.6378780959698012, 0.6302027504736312, 0.6284904523610422, 0.616773266650063, 0.6144108030024114, 0.6137270770149181, 0.6140000000000004,
        0.21722222222222212, 0.26754856063815036, 0.547178981607613, 0.6825835849471493, 0.6848255120880751, 0.712775784969247, 0.7066842545008245,
        0.7020345744268808, 0.6931476737316041, 0.6710886785478944, 0.6501218695989138, 0.6257164975579488, 0.5888463567232898, 0.6237505336392806,
        0.578149766754485, 0.5761890160080455, 0.5922303103985014, 0.5657790974864929, 0.6013376373672517, 0.5693593555949975, 0.5528888888888888,
        0.206777777777778, 0.2644342350096853, 0.4630985572034346, 0.6306849522311501, 0.6899260188747366, 0.7092703879134302, 0.7331416654072416,
        0.7403866219900521, 0.7531493636395633, 0.7685019053395048, 0.771007019842085, 0.7649533772965396, 0.7707020081746302, 0.6897832472092346,
        0.6910618341373851, 0.6805763529796045, 0.6291884772151493, 0.6470904244660671, 0.5962879899497537, 0.6353096798316025, 0.6277777777777779,
        0.19100000000000003, 0.23712276889270198, 0.44482842661392175, 0.6337225464930397, 0.6926462978136392, 0.7316874888663132, 0.7542057211530093,
        0.77172737538752, 0.7876049778429112, 0.795143180926116, 0.7977570986094262, 0.7861445043222344, 0.777182818678971, 0.7057345800650827,
        0.6626698628526632, 0.6600690433654985, 0.6323396431072075, 0.6212684034830293, 0.616281323630018, 0.603728515722033, 0.6040000000000001
    ], 3, 3
]);
export function C_eccentric_orifice_ISO_15377_1998({D, Do}) {
    let beta = Do/D;
    let C = beta*(beta*(3.0428 - 1.7989*beta) - 1.6889) + 0.9355;
    return C;
}
export function C_quarter_circle_orifice_ISO_15377_1998({D, Do}) {
    let beta = Do/D;
    let C = beta*(beta*(1.5084*beta - 1.16158) + 0.3309) + 0.73823;
    return C;
}
export function discharge_coefficient_to_K({D, Do, C}) {
    let beta = Do/D;
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    let root_K = (Math.sqrt(1.0 - beta4*(1.0 - C*C))/(C*beta2) - 1.0);
    return root_K*root_K;
}
export function K_to_discharge_coefficient({D, Do, K}) {
    let beta = Do/D;
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    let root_K = Math.sqrt(K);
    return Math.sqrt((1.0 - beta4)/((2.0*root_K + K)*beta4));
}
export function dP_orifice({D, Do, P1, P2, C}) {
    let beta = Do/D;
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    let dP = P1 - P2;
    let delta_w = (Math.sqrt(1.0 - beta4*(1.0 - C*C)) - C*beta2)/(
               Math.sqrt(1.0 - beta4*(1.0 - C*C)) + C*beta2)*dP;
    return delta_w;
}
export function velocity_of_approach_factor({D, Do}) {
    return 1.0/Math.sqrt(1.0 - (Do/D)**4);
}
export function flow_coefficient({D, Do, C}) {
    return C*1.0/Math.sqrt(1.0 - (Do/D)**4);
}
export function nozzle_expansibility({D, Do, P1, P2, k, beta=null}) {
    if( beta === null ) {
        let beta = Do/D;
    }
    let beta2 = beta*beta;
    let beta4 = beta2*beta2;
    let tau = P2/P1;
    if( k === 1.0 ) {
        /*Avoid a zero division error:
        from sympy import *
        D, Do, P1, P2, k = symbols('D, Do, P1, P2, k')
        beta = Do/D
        tau = P2/P1
        term1 = k*tau**(2/k )/(k - 1)
        term2 = (1 - beta**4)/(1 - beta**4*tau**(2/k))
        term3 = (1 - tau**((k - 1)/k))/(1 - tau)
        val= Math.sqrt(term1*term2*term3)
        print(simplify(limit((term1*term2*term3), k, 1)))
        */
        let limit_val = (P1*(P2**2)*(-(D**4) + Do**4)*Math.log(P2/P1)/((D**4)*(P1**3)
                    - (D**4)*P1**2*P2 - (Do**4)*P1*P2**2 + (Do**4)*(P2**3)));
        return Math.sqrt(limit_val);
    }
    let term1 = k*tau**(2.0/k)/(k - 1.0);
    let term2 = (1.0 - beta4)/(1.0 - beta4*tau**(2.0/k));
    if( tau === 1.0 ) {
        /*Avoid a zero division error.
        Obtained with:
            from sympy import *
            tau, k = symbols('tau, k')
            expr = (1 - tau**((k - 1)/k))/(1 - tau)
            limit(expr, tau, 1)
        */
        let term3 = (k - 1.0)/k;
    } else {
        // This form of the equation is mathematically equivalent but
        // does not have issues where k = `.
        term3 = (P1 - P2*(tau)**(-1.0/k))/(P1 - P2);
    }
        // term3 = (1.0 - tau**((k - 1.0)/k))/(1.0 - tau)
    return Math.sqrt(term1*term2*term3);
}
export function C_long_radius_nozzle({D, Do, rho, mu, m}) {
    let A_pipe = Math.PI/4.*D*D;
    let v = m/(A_pipe*rho);
    let Re_D = rho*v*D/mu;
    let beta = Do/D;
    return 0.9965 - 0.00653*Math.sqrt(beta)*Math.sqrt(1E6/Re_D);
}
export function C_ISA_1932_nozzle({D, Do, rho, mu, m}) {
    let A_pipe = Math.PI/4.*D*D;
    let v = m/(A_pipe*rho);
    let Re_D = rho*v*D/mu;
    let beta = Do/D;
    let C = (0.9900 - 0.2262*beta**4.1
         - (0.00175*beta**2 - 0.0033*beta**4.15)*(1E6/Re_D)**1.15);
    return C;
}
export function C_venturi_nozzle({D, Do}) {
    let beta = Do/D;
    return 0.9858 - 0.198*beta**4.5;
}
// Relative pressure loss as a function of beta reatio for venturi nozzles
// Venturi nozzles should be between 65 mm and 500 mm; there are high and low
// loss ratios , with the high losses corresponding to small diameters,
// low high losses corresponding to large diameters
// Interpolation can be performed.
let venturi_tube_betas = [0.299160, 0.299470, 0.312390, 0.319010, 0.326580, 0.337290,
          0.342020, 0.347060, 0.359030, 0.365960, 0.372580, 0.384870,
          0.385810, 0.401250, 0.405350, 0.415740, 0.424250, 0.434010,
          0.447880, 0.452590, 0.471810, 0.473090, 0.493540, 0.499240,
          0.516530, 0.523800, 0.537630, 0.548060, 0.556840, 0.573890,
          0.582350, 0.597820, 0.601560, 0.622650, 0.626490, 0.649480,
          0.650990, 0.668700, 0.675870, 0.688550, 0.693180, 0.706180,
          0.713330, 0.723510, 0.749540, 0.749650];
let venturi_tube_dP_high = [0.164534, 0.164504, 0.163591, 0.163508, 0.163439,
        0.162652, 0.162224, 0.161866, 0.161238, 0.160786,
        0.160295, 0.159280, 0.159193, 0.157776, 0.157467,
        0.156517, 0.155323, 0.153835, 0.151862, 0.151154,
        0.147840, 0.147613, 0.144052, 0.143050, 0.140107,
        0.138981, 0.136794, 0.134737, 0.132847, 0.129303,
        0.127637, 0.124758, 0.124006, 0.119269, 0.118449,
        0.113605, 0.113269, 0.108995, 0.107109, 0.103688,
        0.102529, 0.099567, 0.097791, 0.095055, 0.087681,
        0.087648];
let venturi_tube_dP_low = [0.089232, 0.089218, 0.088671, 0.088435, 0.088206,
   0.087853, 0.087655, 0.087404, 0.086693, 0.086241,
   0.085813, 0.085142, 0.085102, 0.084446, 0.084202,
   0.083301, 0.082470, 0.081650, 0.080582, 0.080213,
   0.078509, 0.078378, 0.075989, 0.075226, 0.072700,
   0.071598, 0.069562, 0.068128, 0.066986, 0.064658,
   0.063298, 0.060872, 0.060378, 0.057879, 0.057403,
   0.054091, 0.053879, 0.051726, 0.050931, 0.049362,
   0.048675, 0.046522, 0.045381, 0.043840, 0.039913,
   0.039896];
//ratios_average = 0.5*(ratios_high + ratios_low)
let D_bound_venturi_tube = [0.065, 0.5];
export function dP_venturi_tube({D, Do, P1, P2}) {
    // Effect of Re is not currently included
    let beta = Do/D;
    let epsilon_D65 = interp(beta, venturi_tube_betas, venturi_tube_dP_high);
    let epsilon_D500 = interp(beta, venturi_tube_betas, venturi_tube_dP_low);
    let epsilon = interp(D, D_bound_venturi_tube, [epsilon_D65, epsilon_D500]);
    return epsilon*(P1 - P2);
}
export function diameter_ratio_cone_meter({D, Dc}) {
    let D_ratio = Dc/D;
    return Math.sqrt(1.0 - D_ratio*D_ratio);
}
export function cone_meter_expansibility_Stewart({D, Dc, P1, P2, k}) {
    let dP = P1 - P2;
    let beta = diameter_ratio_cone_meter(D, Dc);
    beta *= beta;
    beta *= beta;
    return 1.0 - (0.649 + 0.696*beta)*dP/(k*P1);
}
export function dP_cone_meter({D, Dc, P1, P2}) {
    let dP = P1 - P2;
    let beta = diameter_ratio_cone_meter(D, Dc);
    return (1.09 - 0.813*beta)*dP;
}
export function diameter_ratio_wedge_meter({D, H}) {
    let H_D = H/D;
    let t0 = 1.0 - 2.0*H_D;
    let t1 = Math.acos(t0);
    let t2 = t0 + t0;
    let t3 = Math.sqrt(H_D - H_D*H_D);
    let t4 = t1 - t2*t3;
    return Math.sqrt(pi_inv*t4);
}
export function C_wedge_meter_Miller({D, H}) {
    let beta = diameter_ratio_wedge_meter(D, H);
    beta *= beta;
    if( D <= 0.7*inch ) {
        // suggested limit 0.5 inch for this equation
        let C = 0.7883 + 0.107*(1.0 - beta);
    } else if( D <= 1.4*inch ) {
        // Suggested limit is under 1.5 inches
        C = 0.6143 + 0.718*(1.0 - beta);
    } else {
        C = 0.5433 + 0.2453*(1.0 - beta);
    }
    return C;
}
export function C_wedge_meter_ISO_5167_6_2017({D, H}) {
    let beta = diameter_ratio_wedge_meter(D, H);
    return 0.77 - 0.09*beta;
}
export function dP_wedge_meter({D, H, P1, P2}) {
    let dP = P1 - P2;
    let beta = diameter_ratio_wedge_meter(D, H);
    return (1.09 - 0.79*beta)*dP;
}
export function C_Reader_Harris_Gallagher_wet_venturi_tube({mg, ml, rhog, rhol, D, Do, H=1}) {
    let V = 4.0*mg/(rhog*Math.PI*D*D);
    let Frg = Froude_densimetric(V, { L: D, rho1: rhol, rho2: rhog, heavy: false });
    let beta = Do/D;
    let beta2 = beta*beta;
    let Fr_gas_th = Frg/(beta2*Math.sqrt(beta));
    let n = Math.max(0.583 - 0.18*beta2 - 0.578*Math.exp(-0.8*Frg/H),
            0.392 - 0.18*beta2);
    let t0 = rhog/rhol;
    let t1 = (t0)**n;
    let C_Ch = t1 + 1.0/t1;
    let X =  ml/mg*Math.sqrt(t0);
    // OF = Math.sqrt(1.0 + X*(C_Ch + X))
    let C = 1.0 - 0.0463*Math.exp(-0.05*Fr_gas_th)*min(1.0, Math.sqrt(X/0.016));
    return C;
}
export function dP_Reader_Harris_Gallagher_wet_venturi_tube({D, Do, P1, P2, ml, mg, rhol,
                                                rhog, H=1.0}) {
    let dP = P1 - P2;
    let beta = Do/D;
    let X =  ml/mg*Math.sqrt(rhog/rhol);
    let V = 4*mg/(rhog*Math.PI*D*D);
    let Frg =  Froude_densimetric(V, { L: D, rho1: rhol, rho2: rhog, heavy: false });
    let Y_ratio = 1.0 - Math.exp(-35.0*X**0.75*Math.exp(-0.28*Frg/H));
    let Y_max = 0.61*Math.exp(-11.0*rhog/rhol - 0.045*Frg/H);
    let Y = Y_max*Y_ratio;
    let rhs = -0.0896 - 0.48*beta**9;
    let dw = dP*(Y - rhs);
    return dw;
}
// Venturi tube loss coefficients as a function of Re
let as_cast_convergent_venturi_Res = [4E5, 6E4, 1E5, 1.5E5];
let as_cast_convergent_venturi_Cs = [0.957, 0.966, 0.976, 0.982];
export let machined_convergent_venturi_Res = [5E4, 1E5, 2E5, 3E5,
                                   7.5E5, // 5E5 to 1E6
                                   1.5E6, // 1E6 to 2E6
                                   5E6]; // 2E6 to 1E8
export let machined_convergent_venturi_Cs = [0.970, 0.977, 0.992, 0.998, 0.995, 1.000, 1.010];
let rough_welded_convergent_venturi_Res = [4E4, 6E4, 1E5];
let rough_welded_convergent_venturi_Cs = [0.96, 0.97, 0.98];
let as_cast_convergent_entrance_machined_venturi_Res = [1E4, 6E4, 1E5, 1.5E5,
                                                    3.5E5, // 2E5 to 5E5
                                                    3.2E6]; // 5E5 to 3.2E6
let as_cast_convergent_entrance_machined_venturi_Cs = [0.963, 0.978, 0.98, 0.987, 0.992, 0.995];
let venturi_Res_Hollingshead = [1.0, 5.0, 10.0, 20.0, 30.0, 40.0, 60.0, 80.0, 100.0, 200.0, 300.0, 500.0, 1000.0, 2000.0, 3000.0, 5000.0, 10000.0, 30000.0, 50000.0, 75000.0, 100000.0, 1000000.0, 10000000.0, 50000000.0];
let venturi_logRes_Hollingshead = [0.0, 1.6094379124341003, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221, 4.382026634673881, 4.605170185988092, 5.298317366548036, 5.703782474656201, 6.214608098422191, 6.907755278982137, 7.600902459542082, 8.006367567650246, 8.517193191416238, 9.210340371976184, 10.308952660644293, 10.819778284410283, 11.225243392518447, 11.512925464970229, 13.815510557964274, 16.11809565095832, 17.72753356339242];
let venturi_smooth_Cs_Hollingshead = [0.163, 0.336, 0.432, 0.515, 0.586, 0.625, 0.679, 0.705, 0.727, 0.803, 0.841, 0.881, 0.921, 0.937, 0.944, 0.954, 0.961, 0.967, 0.967, 0.97, 0.971, 0.973, 0.974, 0.975];
let venturi_sharp_Cs_Hollingshead = [0.146, 0.3, 0.401, 0.498, 0.554, 0.596, 0.65, 0.688, 0.715, 0.801, 0.841, 0.884, 0.914, 0.94, 0.947, 0.944, 0.952, 0.959, 0.962, 0.963, 0.965, 0.967, 0.967, 0.967];
let CONE_METER_C = 0.82;
/*Constant loss coefficient for flow cone meters*/
let ROUGH_WELDED_CONVERGENT_VENTURI_TUBE_C = 0.985;
/*Constant loss coefficient for rough-welded convergent venturi tubes*/
export let MACHINED_CONVERGENT_VENTURI_TUBE_C = 0.995;
/*Constant loss coefficient for machined convergent venturi tubes*/
let AS_CAST_VENTURI_TUBE_C = 0.984;
/*Constant loss coefficient for as-cast venturi tubes*/
let ISO_15377_CONICAL_ORIFICE_C = 0.734;
/*Constant loss coefficient for conical orifice plates according to ISO 15377*/
let cone_Res_Hollingshead = [1.0, 5.0, 10.0, 20.0, 30.0, 40.0, 60.0, 80.0, 100.0, 150.0, 200.0, 300.0, 500.0, 1000.0, 2000.0, 3000.0, 4000.0, 5000.0, 7500.0,
    10000.0, 20000.0, 30000.0, 100000.0, 1000000.0, 10000000.0, 50000000.0
];
let cone_logRes_Hollingshead = [0.0, 1.6094379124341003, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221,
    4.382026634673881, 4.605170185988092, 5.0106352940962555, 5.298317366548036, 5.703782474656201, 6.214608098422191, 6.907755278982137, 7.600902459542082,
    8.006367567650246, 8.294049640102028, 8.517193191416238, 8.922658299524402, 9.210340371976184, 9.903487552536127, 10.308952660644293,
    11.512925464970229, 13.815510557964274, 16.11809565095832, 17.72753356339242
];
let cone_betas_Hollingshead = [0.6611, 0.6995, 0.8203];
let cone_beta_6611_Hollingshead_Cs = [0.066, 0.147, 0.207, 0.289, 0.349, 0.396, 0.462, 0.506, 0.537, 0.588, 0.622, 0.661, 0.7, 0.727, 0.75, 0.759, 0.763, 0.765,
    0.767, 0.773, 0.778, 0.789, 0.804, 0.803, 0.805, 0.802
];
let cone_beta_6995_Hollingshead_Cs = [0.067, 0.15, 0.21, 0.292, 0.35, 0.394, 0.458, 0.502, 0.533, 0.584, 0.615, 0.645, 0.682, 0.721, 0.742, 0.75, 0.755, 0.757,
    0.763, 0.766, 0.774, 0.781, 0.792, 0.792, 0.79, 0.787
];
let cone_beta_8203_Hollingshead_Cs = [0.057, 0.128, 0.182, 0.253, 0.303, 0.343, 0.4, 0.44, 0.472, 0.526, 0.557, 0.605, 0.644, 0.685, 0.705, 0.714, 0.721, 0.722,
    0.724, 0.723, 0.725, 0.731, 0.73, 0.73, 0.741, 0.734
];
let cone_Hollingshead_Cs = [cone_beta_6611_Hollingshead_Cs, cone_beta_6995_Hollingshead_Cs,
    cone_beta_8203_Hollingshead_Cs
];
let cone_Hollingshead_tck = implementation_optimize_tck([
    [0.6611, 0.6611, 0.6611, 0.8203, 0.8203, 0.8203],
    [0.0, 0.0, 0.0, 0.0, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221, 4.382026634673881,
        4.605170185988092, 5.0106352940962555, 5.298317366548036, 5.703782474656201, 6.214608098422191, 6.907755278982137, 7.600902459542082,
        8.006367567650246, 8.294049640102028, 8.517193191416238, 8.922658299524402, 9.210340371976184, 9.903487552536127, 10.308952660644293,
        11.512925464970229, 13.815510557964274, 17.72753356339242, 17.72753356339242, 17.72753356339242, 17.72753356339242
    ],
    [0.06600000000000003, 0.09181180887944293, 0.1406341453010674, 0.27319769866300025, 0.34177839953532274, 0.4025880076725502, 0.4563149328810349,
        0.5035445307357295, 0.5458473693359689, 0.583175639128474, 0.628052124545805, 0.6647198135005781, 0.7091524396786245, 0.7254729823419331,
        0.7487816963926843, 0.7588145502817809, 0.7628692532631826, 0.7660482147214834, 0.7644188319583379, 0.7782644144006241, 0.7721508139116487,
        0.7994728794028244, 0.8076742194714519, 0.7986221420822799, 0.8086240532850298, 0.802, 0.07016232064017663, 0.1059162635703894,
        0.1489681838592814, 0.28830815748629207, 0.35405213706957395, 0.40339795504063664, 0.4544570323055189, 0.5034637712201067, 0.5448190156693709,
        0.5840164245031125, 0.6211559598098063, 0.6218648844980823, 0.6621745760710729, 0.7282379546292953, 0.7340030734801267, 0.7396324865779599,
        0.7489736798953754, 0.7480726412914717, 0.7671564751169978, 0.756853660688892, 0.7787029642272745, 0.7742381131312691, 0.7887584162443445,
        0.7857610450218329, 0.7697076645551957, 0.7718300910596032, 0.05700000000000002, 0.07612544859943549, 0.12401733415778271, 0.24037452209595875,
        0.29662463502593156, 0.34859536586855205, 0.39480085719322505, 0.43661601622480606, 0.48091259102454764, 0.5240691286186233, 0.5590609288020619,
        0.6144556048716696, 0.6471713640567137, 0.6904158809061184, 0.7032590252050219, 0.712177974557301, 0.7221845303680273, 0.721505707129694,
        0.7249822376264551, 0.7218890085289907, 0.7221848475768714, 0.7371751354515526, 0.7252385062304629, 0.7278943803933404, 0.7496546607029086,
        0.7340000000000001
    ],
    2, 3
]);
let wedge_Res_Hollingshead = [1.0, 5.0, 10.0, 20.0, 30.0, 40.0, 60.0, 80.0, 100.0, 200.0, 300.0, 400.0, 500.0, 5000.0, 1.00E+04, 1.00E+05, 1.00E+06, 5.00E+07];
let wedge_logRes_Hollingshead = [0.0, 1.6094379124341003, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221,
    4.382026634673881, 4.605170185988092, 5.298317366548036, 5.703782474656201, 5.991464547107982, 6.214608098422191, 8.517193191416238, 9.210340371976184,
    11.512925464970229, 13.815510557964274, 17.72753356339242
];
let wedge_beta_5023_Hollingshead = [0.145, 0.318, 0.432, 0.551, 0.61, 0.641, 0.674, 0.69, 0.699, 0.716, 0.721, 0.725, 0.73, 0.729, 0.732, 0.732, 0.731, 0.733];
let wedge_beta_611_Hollingshead = [0.127, 0.28, 0.384, 0.503, 0.567, 0.606, 0.645, 0.663, 0.672, 0.688, 0.694, 0.7, 0.705, 0.7, 0.702, 0.695, 0.699, 0.705];
let wedge_betas_Hollingshead = [.5023, .611];
let wedge_Hollingshead_Cs = [wedge_beta_5023_Hollingshead, wedge_beta_611_Hollingshead];
let wedge_Hollingshead_tck = implementation_optimize_tck([
    [0.5023, 0.5023, 0.611, 0.611],
    [0.0, 0.0, 0.0, 0.0, 2.302585092994046, 2.995732273553991, 3.4011973816621555, 3.6888794541139363, 4.0943445622221, 4.382026634673881,
        4.605170185988092, 5.298317366548036, 5.703782474656201, 5.991464547107982, 6.214608098422191, 8.517193191416238, 9.210340371976184,
        11.512925464970229, 17.72753356339242, 17.72753356339242, 17.72753356339242, 17.72753356339242
    ],
    [0.14500000000000005, 0.18231832425722, 0.3339917130006919, 0.5379467710226973, 0.6077700659940896, 0.6459542943925077, 0.6729757007770231,
        0.6896405007576225, 0.7054863114589583, 0.7155740600632635, 0.7205446407610863, 0.7239576816068966, 0.7483627568160166, 0.7232963355919931,
        0.7366325320490953, 0.7264222143567053, 0.7339605394126009, 0.7330000000000001, 0.1270000000000001, 0.16939873865132285, 0.2828494933525669,
        0.4889107009077842, 0.5623120043524101, 0.6133092379676948, 0.6437092394687915, 0.6629923366662017, 0.6782934366011034, 0.687302374134782,
        0.6927470053128909, 0.6993992364234898, 0.7221204483546849, 0.6947577293284015, 0.7063701306810815, 0.6781614534359871, 0.7185326811948407,
        0.7050000000000001
    ],
    1, 3
]);
let beta_simple_meters = [ISO_5167_ORIFICE, ISO_15377_ECCENTRIC_ORIFICE, ISO_15377_CONICAL_ORIFICE, ISO_15377_QUARTER_CIRCLE_ORIFICE, MILLER_ORIFICE, MILLER_ECCENTRIC_ORIFICE, MILLER_SEGMENTAL_ORIFICE, MILLER_CONICAL_ORIFICE, MILLER_QUARTER_CIRCLE_ORIFICE, CONCENTRIC_ORIFICE, ECCENTRIC_ORIFICE, CONICAL_ORIFICE, SEGMENTAL_ORIFICE, QUARTER_CIRCLE_ORIFICE, UNSPECIFIED_METER, HOLLINGSHEAD_VENTURI_SHARP, HOLLINGSHEAD_VENTURI_SMOOTH, HOLLINGSHEAD_ORIFICE, LONG_RADIUS_NOZZLE, ISA_1932_NOZZLE, VENTURI_NOZZLE, AS_CAST_VENTURI_TUBE, MACHINED_CONVERGENT_VENTURI_TUBE, ROUGH_WELDED_CONVERGENT_VENTURI_TUBE];
export let all_meters = beta_simple_meters.concat([CONE_METER, WEDGE_METER, HOLLINGSHEAD_CONE, HOLLINGSHEAD_WEDGE]);
/*Set of string inputs representing all of the different supported flow meters
and their correlations.
*/
let _unsupported_meter_msg = "Supported meter types are %s" % all_meters;
export function differential_pressure_meter_beta({D, D2, meter_type}) {
    if( meter_type in beta_simple_meters ) {
        let beta = D2/D;
    } else if( meter_type === CONE_METER || meter_type === HOLLINGSHEAD_CONE ) {
        beta = diameter_ratio_cone_meter( {D: D, Dc: D2 });
    } else if( meter_type === WEDGE_METER || meter_type === HOLLINGSHEAD_WEDGE ) {
        beta = diameter_ratio_wedge_meter( {D: D, H: D2 });
    } else {
        throw new Error( 'ValueError',_unsupported_meter_msg );
    }
    return beta;
}
let _meter_type_to_corr_default = {
    CONCENTRIC_ORIFICE: ISO_5167_ORIFICE,
    ECCENTRIC_ORIFICE: ISO_15377_ECCENTRIC_ORIFICE,
    CONICAL_ORIFICE: ISO_15377_CONICAL_ORIFICE,
    QUARTER_CIRCLE_ORIFICE: ISO_15377_QUARTER_CIRCLE_ORIFICE,
    SEGMENTAL_ORIFICE: MILLER_SEGMENTAL_ORIFICE,
    };
export function differential_pressure_meter_C_epsilon({D, D2, m, P1, P2, rho, mu, k,
                                          meter_type, taps=null,
                                          tap_position=null, C_specified=null,
                                          epsilon_specified=null}) {
//    // Translate default meter type to implementation specific correlation
    if( meter_type === CONCENTRIC_ORIFICE ) {
        let meter_type = ISO_5167_ORIFICE;
    } else if( meter_type === ECCENTRIC_ORIFICE ) {
        meter_type = ISO_15377_ECCENTRIC_ORIFICE;
    } else if( meter_type === CONICAL_ORIFICE ) {
        meter_type = ISO_15377_CONICAL_ORIFICE;
    } else if( meter_type === QUARTER_CIRCLE_ORIFICE ) {
        meter_type = ISO_15377_QUARTER_CIRCLE_ORIFICE;
    } else if( meter_type === SEGMENTAL_ORIFICE ) {
        meter_type = MILLER_SEGMENTAL_ORIFICE;
    }
    if( meter_type === ISO_5167_ORIFICE ) {
        let C = C_Reader_Harris_Gallagher(D, D2, rho, mu, m, taps);
        let epsilon = orifice_expansibility(D, D2, P1, P2, k);
    } else if( meter_type === ISO_15377_ECCENTRIC_ORIFICE ) {
        C = C_eccentric_orifice_ISO_15377_1998(D, D2);
        epsilon = orifice_expansibility(D, D2, P1, P2, k);
    } else if( meter_type === ISO_15377_QUARTER_CIRCLE_ORIFICE ) {
        C = C_quarter_circle_orifice_ISO_15377_1998(D, D2);
        epsilon = orifice_expansibility(D, D2, P1, P2, k);
    } else if( meter_type === ISO_15377_CONICAL_ORIFICE ) {
        C = ISO_15377_CONICAL_ORIFICE_C;
        // Average of concentric square edge orifice and ISA 1932 nozzles
        let epsilon = 0.5*(orifice_expansibility(D, D2, P1, P2, k)
                       + nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k }));
    } else if( meter_type in [MILLER_ORIFICE, MILLER_ECCENTRIC_ORIFICE,
                      MILLER_SEGMENTAL_ORIFICE, MILLER_QUARTER_CIRCLE_ORIFICE] ) {
        C = C_Miller_1996(D, D2, rho, mu, m, { subtype: meter_type, taps: taps,
                          tap_position: tap_position });
        epsilon = orifice_expansibility(D, D2, P1, P2, k);
    } else if( meter_type === MILLER_CONICAL_ORIFICE ) {
        C = C_Miller_1996(D, D2, rho, mu, m, { subtype: meter_type, taps: taps,
                          tap_position: tap_position });
        epsilon = 0.5*(orifice_expansibility(D, D2, P1, P2, k)
                       + nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k }));
    } else if( meter_type === LONG_RADIUS_NOZZLE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = C_long_radius_nozzle( {D: D, Do: D2, rho: rho, mu: mu, m: m });
    } else if( meter_type === ISA_1932_NOZZLE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = C_ISA_1932_nozzle( {D: D, Do: D2, rho: rho, mu: mu, m: m });
    } else if( meter_type === VENTURI_NOZZLE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = C_venturi_nozzle( {D: D, Do: D2 });
    } else if( meter_type === AS_CAST_VENTURI_TUBE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = AS_CAST_VENTURI_TUBE_C;
    } else if( meter_type === MACHINED_CONVERGENT_VENTURI_TUBE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = MACHINED_CONVERGENT_VENTURI_TUBE_C;
    } else if( meter_type === ROUGH_WELDED_CONVERGENT_VENTURI_TUBE ) {
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
        C = ROUGH_WELDED_CONVERGENT_VENTURI_TUBE_C;
    } else if( meter_type === CONE_METER ) {
        epsilon = cone_meter_expansibility_Stewart( {D: D, Dc: D2, P1: P1, P2: P2, k: k });
        C = CONE_METER_C;
    } else if( meter_type === WEDGE_METER ) {
        let beta = diameter_ratio_wedge_meter( {D: D, H: D2 });
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P1, k: k, beta: beta });
        C = C_wedge_meter_ISO_5167_6_2017( {D: D, H: D2 });
    } else if( meter_type === HOLLINGSHEAD_ORIFICE ) {
        let v = m/((0.25*Math.PI*D*D)*rho);
        let Re_D = rho*v*D/mu;
        C = float(bisplev(D2/D, Math.log(Re_D), orifice_std_Hollingshead_tck));
        epsilon = orifice_expansibility(D, D2, P1, P2, k);
    } else if( meter_type === HOLLINGSHEAD_VENTURI_SMOOTH ) {
        v = m/((0.25*Math.PI*D*D)*rho);
        Re_D = rho*v*D/mu;
        C = interp(Math.log(Re_D), venturi_logRes_Hollingshead, venturi_smooth_Cs_Hollingshead, { extrapolate: true });
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
    } else if( meter_type === HOLLINGSHEAD_VENTURI_SHARP ) {
        v = m/((0.25*Math.PI*D*D)*rho);
        Re_D = rho*v*D/mu;
        C = interp(Math.log(Re_D), venturi_logRes_Hollingshead, venturi_sharp_Cs_Hollingshead, { extrapolate: true });
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P2, k: k });
    } else if( meter_type === HOLLINGSHEAD_CONE ) {
        v = m/((0.25*Math.PI*D*D)*rho);
        Re_D = rho*v*D/mu;
        beta = diameter_ratio_cone_meter(D, D2);
        C = float(bisplev(beta, Math.log(Re_D), cone_Hollingshead_tck));
        epsilon = cone_meter_expansibility_Stewart( {D: D, Dc: D2, P1: P1, P2: P2, k: k });
    } else if( meter_type === HOLLINGSHEAD_WEDGE ) {
        v = m/((0.25*Math.PI*D*D)*rho);
        Re_D = rho*v*D/mu;
        beta = diameter_ratio_wedge_meter( {D: D, H: D2 });
        C = float(bisplev(beta, Math.log(Re_D), wedge_Hollingshead_tck));
        epsilon = nozzle_expansibility( {D: D, Do: D2, P1: P1, P2: P1, k: k, beta: beta });
    } else if( meter_type === UNSPECIFIED_METER ) {
        epsilon = orifice_expansibility(D, D2, P1, P2, k); // Default to orifice type expansibility
        if( C_specified === null ) {
            throw new Error( 'ValueError',"For unspecified meter type, C_specified is required" );
        }
    } else {
        throw new Error( 'ValueError',_unsupported_meter_msg );
    }
    if( C_specified !== null ) {
        C = C_specified;
    }
    if( epsilon_specified !== null ) {
        epsilon = epsilon_specified;
    }
    return C, epsilon;
}
export function err_dp_meter_solver_m({m_D, D, D2, P1, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified}) {
    let m = m_D*D;
    let [C, epsilon] = differential_pressure_meter_C_epsilon(D, D2, m, P1, P2, rho,
                                                  mu, k, meter_type, {
                                                  taps: taps, tap_position: tap_position,
                                                  C_specified: C_specified, epsilon_specified: epsilon_specified });
    let m_calc = flow_meter_discharge( {D: D, Do: D2, P1: P1, P2: P2, rho: rho,
                                C: C, expansibility: epsilon });
    let err =  m - m_calc;
    return err;
}
export function err_dp_meter_solver_P2({P2, D, D2, m, P1, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified}) {
    let [C, epsilon] = differential_pressure_meter_C_epsilon(D, D2, m, P1, P2, rho,
                                                  mu, k, meter_type, {
                                                  taps: taps, tap_position: tap_position,
                                                  C_specified: C_specified, epsilon_specified: epsilon_specified });
    let m_calc = flow_meter_discharge( {D: D, Do: D2, P1: P1, P2: P2, rho: rho,
                                C: C, expansibility: epsilon });
    return m - m_calc;
}
export function err_dp_meter_solver_D2({D2, D, m, P1, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified}) {
    let [C, epsilon] = differential_pressure_meter_C_epsilon(D, D2, m, P1, P2, rho,
                                                  mu, k, meter_type, {
                                                  taps: taps, tap_position: tap_position, C_specified: C_specified,
                                                  epsilon_specified: epsilon_specified });
    let m_calc = flow_meter_discharge( {D: D, Do: D2, P1: P1, P2: P2, rho: rho,
                                C: C, expansibility: epsilon });
    return m - m_calc;
}
export function err_dp_meter_solver_P1({P1, D, D2, m, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified}) {
    let [C, epsilon] = differential_pressure_meter_C_epsilon(D, D2, m, P1, P2, rho,
                                                  mu, k, meter_type, {
                                                  taps: taps, tap_position: tap_position, C_specified: C_specified,
                                                  epsilon_specified: epsilon_specified });
    let m_calc = flow_meter_discharge( {D: D, Do: D2, P1: P1, P2: P2, rho: rho,
                                C: C, expansibility: epsilon });
    return m - m_calc;
}
export function differential_pressure_meter_solver({D, rho, mu, k=null, D2=null, P1=null, P2=null,
                                       m=null, meter_type=ISO_5167_ORIFICE,
                                       taps=null, tap_position=null,
                                       C_specified=null, epsilon_specified=null}) {
    if( k === null && epsilon_specified !== null ) {
        let k = 1.4;
    }
    if( m === null && D !== null && D2 !== null && P1 !== null && P2 !== null ) {
        // Initialize via analytical formulas
        let C_guess = 0.7;
        let D4 = D*D;
        D4 *= D4;
        let D24 = D2*D2;
        D24 *= D24;
        let m_guess = root_two*Math.PI*C_guess*D2*D2*Math.sqrt(D4*rho*(P1 - P2)/(D4 - D24))*0.25;
        let m_D_guess = m_guess/D;
        // Diameter to mass flow ratio
        // m_D_guess = 40
        // if rho < 100.0:
        //     m_D_guess *= 1e-2
        return secant(err_dp_meter_solver_m, m_D_guess, { args: [D, D2, P1, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified], low: 1e-40 })*D;
    } else if( D2 === null && D !== null && m !== null && P1 !== null && P2 !== null ) {
        let args = [D, m, P1, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified];
        try {
            return brenth(err_dp_meter_solver_D2, D*(1-1E-9), D*5E-3, { args: args });
        } catch( e ) {
            try {
                return secant(err_dp_meter_solver_D2, D*.3, { args: args, high: D, low: D*1e-10 });
            } catch( e ) {
                return secant(err_dp_meter_solver_D2, D*.75, { args: args, high: D, low: D*1e-10 });
            }
        }
    } else if( P2 === null && D !== null && D2 !== null && m !== null && P1 !== null ) {
        args = [D, D2, m, P1, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified];
        try {
            return brenth(err_dp_meter_solver_P2, P1*(1-1E-9), P1*0.5, { args: args });
        } catch( e ) {
            return secant(err_dp_meter_solver_P2, P1*0.5, { low: P1*1e-10, args: args, high: P1, bisection: true });
        }
    } else if( P1 === null && D !== null && D2 !== null && m !== null && P2 !== null ) {
        args = [D, D2, m, P2, rho, mu, k, meter_type, taps, tap_position, C_specified, epsilon_specified];
        try {
            return brenth(err_dp_meter_solver_P1, P2*(1+1E-9), P2*1.4, { args: args });
        } catch( e ) {
            return secant(err_dp_meter_solver_P1, P2*1.5, { args: args, low: P2, bisection: true });
        }
    } else {
        throw new Error( 'ValueError','Solver is capable of solving for one of P1, P2, D2, or m only.' );
    }
// Set of orifice types that get their dP calculated with `dP_orifice`.
}
let _dP_orifice_set = [ISO_5167_ORIFICE, ISO_15377_ECCENTRIC_ORIFICE, ISO_15377_CONICAL_ORIFICE, ISO_15377_QUARTER_CIRCLE_ORIFICE, MILLER_ORIFICE, MILLER_ECCENTRIC_ORIFICE, MILLER_SEGMENTAL_ORIFICE, MILLER_CONICAL_ORIFICE, MILLER_QUARTER_CIRCLE_ORIFICE, HOLLINGSHEAD_ORIFICE, CONCENTRIC_ORIFICE, ECCENTRIC_ORIFICE, CONICAL_ORIFICE, SEGMENTAL_ORIFICE, QUARTER_CIRCLE_ORIFICE];
let _missing_C_msg = "Parameter C is required for this orifice type";
export function differential_pressure_meter_dP({D, D2, P1, P2, C=null,
                                   meter_type=ISO_5167_ORIFICE}) {
    if( meter_type in _dP_orifice_set ) {
        if( C === null ) {
            throw new Error( 'ValueError',_missing_C_msg );
        }
        let dP = dP_orifice( {D: D, Do: D2, P1: P1, P2: P2, C: C });
    } else if( meter_type === LONG_RADIUS_NOZZLE ) {
        if( C === null ) {
            throw new Error( 'ValueError',_missing_C_msg );
        }
        dP = dP_orifice( {D: D, Do: D2, P1: P1, P2: P2, C: C });
    } else if( meter_type === ISA_1932_NOZZLE ) {
        if( C === null ) {
            throw new Error( 'ValueError',_missing_C_msg );
        }
        dP = dP_orifice( {D: D, Do: D2, P1: P1, P2: P2, C: C });
    } else if( meter_type === VENTURI_NOZZLE ) {
        throw new Error( 'NotImplementedError',"Venturi meter does not have an implemented pressure drop correlation" );
    } else if( (meter_type === AS_CAST_VENTURI_TUBE
          || meter_type === MACHINED_CONVERGENT_VENTURI_TUBE
          || meter_type === ROUGH_WELDED_CONVERGENT_VENTURI_TUBE
          || meter_type === HOLLINGSHEAD_VENTURI_SMOOTH
          || meter_type === HOLLINGSHEAD_VENTURI_SHARP) ) {
        dP = dP_venturi_tube( {D: D, Do: D2, P1: P1, P2: P2 });
    } else if( meter_type === CONE_METER || meter_type === HOLLINGSHEAD_CONE ) {
        dP = dP_cone_meter( {D: D, Dc: D2, P1: P1, P2: P2 });
    } else if( meter_type === WEDGE_METER || meter_type === HOLLINGSHEAD_WEDGE ) {
        dP = dP_wedge_meter( {D: D, H: D2, P1: P1, P2: P2 });
    } else {
        throw new Error( 'ValueError',_unsupported_meter_msg );
    }
    return dP;
}
