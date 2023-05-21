import { radians, degrees } from './fluids.helpers.js' ;
import { inch, deg2rad, rad2deg } from './fluids.constants.js' ;
import { friction_factor, Clamond, friction_factor_curved, ft_Crane } from './fluids.friction.js' ;
import { horner, interp, splev, bisplev, implementation_optimize_tck, tck_interp2d_linear } from './fluids.numerics_init.js' ;
import { float } from './_pyjs.js';
let __all__ = ['contraction_sharp', 'contraction_round', 'contraction_round_Miller', 'contraction_conical', 'contraction_conical_Crane', 'contraction_beveled',  'diffuser_sharp', 'diffuser_conical', 'diffuser_conical_staged', 'diffuser_curved', 'diffuser_pipe_reducer', 'entrance_sharp', 'entrance_distance', 'entrance_angled', 'entrance_rounded', 'entrance_beveled', 'entrance_beveled_orifice', 'entrance_distance_45_Miller', 'exit_normal', 'bend_rounded', 'bend_rounded_Miller', 'bend_rounded_Crane', 'bend_miter', 'bend_miter_Miller', 'helix', 'spiral','Darby3K', 'Hooper2K', 'Kv_to_Cv', 'Cv_to_Kv', 'Kv_to_K', 'K_to_Kv', 'Cv_to_K', 'K_to_Cv', 'change_K_basis', 'Darby', 'Hooper', 'K_gate_valve_Crane', 'K_angle_valve_Crane', 'K_globe_valve_Crane', 'K_swing_check_valve_Crane', 'K_lift_check_valve_Crane', 'K_tilting_disk_check_valve_Crane', 'K_globe_stop_check_valve_Crane', 'K_angle_stop_check_valve_Crane', 'K_ball_valve_Crane', 'K_diaphragm_valve_Crane', 'K_foot_valve_Crane', 'K_butterfly_valve_Crane', 'K_plug_valve_Crane', 'K_branch_converging_Crane', 'K_run_converging_Crane', 'K_branch_diverging_Crane', 'K_run_diverging_Crane', 'v_lift_valve_Crane'];
export function change_K_basis({K1, D1, D2}) {
    let r = D2/D1;
    r *= r;
    return K1*r*r;
}
////// Entrances
export let entrance_sharp_methods = ['Rennels', 'Swamee', 'Blevins', 'Idelchik', 'Crane', 'Miller'];
export let entrance_sharp_method_missing = ('Specified method not recognized; methods are %s' %(entrance_sharp_methods));
export function entrance_sharp(method='Rennels') {
    if( method === null ) {
        let method = 'Rennels';
    }
    if( method in ['Swamee', 'Blevins', 'Crane', 'Idelchik'] ) {
        return 0.50;
    } else if( method === 'Miller' ) {
        // From entrance_rounded(Di=0.9, rc=0.0, method='Miller'); Not saying it's right
        return 0.5092676683721356;
} else if( method === 'Rennels' ) {
        return 0.57;
} else {
        throw new Error( 'ValueError',entrance_sharp_method_missing );
    }
}
export let entrance_distance_Miller_coeffs = [3.5979871366071166, -2.735407311020481, -14.08678246875138, 10.637236472292983, 21.99568490754116, -16.38501138746954, -17.62779826803278, 12.945551397987447, 7.715463242992863, -5.850893341031715, -1.3809402870404826, 1.179637166644488, 0.08781141316107932, -0.09751968111743672, 0.00501792061942849, 0.0026378278251172615, 0.5309019247035696];
export let entrance_distance_Idelchik_l_Di = [0.0, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 10.0]; // last point infinity
export let entrance_distance_Idelchik_t_Di = [0.0, 0.004, 0.008, 0.012, 0.016, 0.02, 0.024, 0.03, 0.04, 0.05, 1.0]; // last point infinity
export let entrance_distance_Idelchik_dat = [[0.5, 0.57, 0.63, 0.68, 0.73, 0.8, 0.86, 0.92, 0.97, 1, 1],[0.5, 0.54, 0.58, 0.63, 0.67, 0.74, 0.8, 0.86, 0.9, 0.94, 0.94],[0.5, 0.53, 0.55, 0.58, 0.62, 0.68, 0.74, 0.81, 0.85, 0.88, 0.88],[0.5, 0.52, 0.53, 0.55, 0.58, 0.63, 0.68, 0.75, 0.79, 0.83, 0.83],[0.5, 0.51, 0.51, 0.53, 0.55, 0.58, 0.64, 0.7, 0.74, 0.77, 0.77],[0.5, 0.51, 0.51, 0.52, 0.53, 0.55, 0.6, 0.66, 0.69, 0.72, 0.72],[0.5, 0.5, 0.5, 0.51, 0.52, 0.53, 0.58, 0.62, 0.65, 0.68, 0.68],[0.5, 0.5, 0.5, 0.51, 0.52, 0.52, 0.54, 0.57, 0.59, 0.61, 0.61],[0.5, 0.5, 0.5, 0.51, 0.51, 0.51, 0.51, 0.52, 0.52, 0.54, 0.54],[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
// TODO: check named arguments
// let entrance_distance_Idelchik_tck = tck_interp2d_linear(entrance_distance_Idelchik_l_Di, entrance_distance_Idelchik_t_Di, entrance_distance_Idelchik_dat, kx=1, ky=1);
export let entrance_distance_Idelchik_tck = tck_interp2d_linear(entrance_distance_Idelchik_l_Di, entrance_distance_Idelchik_t_Di, entrance_distance_Idelchik_dat, 1, 1);
export let entrance_distance_Idelchik_obj = (x, y) => bisplev(x, y, entrance_distance_Idelchik_tck);
export let entrance_distance_Harris_t_Di = [0.00322, 0.007255, 0.01223, 0.018015, 0.021776, 0.029044, 0.039417, 0.049519, 0.058012, 0.066234, 0.076747, 0.088337, 0.098714, 0.109497, 0.121762, 0.130655, 0.14036, 0.148986, 0.159902, 0.17149, 0.179578, 0.189416, 0.200602, 0.208148, 0.217716, 0.228232, 0.239821, 0.250063, 0.260845, 0.270818, 0.280116, 0.289145];
export let entrance_distance_Harris_Ks = [0.894574, 0.832435, 0.749768, 0.671543, 0.574442, 0.508432, 0.476283, 0.430261, 0.45027, 0.45474, 0.461993, 0.457042, 0.458745, 0.464889, 0.471594, 0.461638, 0.467778, 0.475024, 0.474509, 0.456239, 0.466258, 0.467959, 0.466336, 0.459705, 0.454746, 0.478092, 0.468701, 0.467074, 0.468779, 0.467151, 0.46441, 0.458894];
export let entrance_distance_Harris_tck = implementation_optimize_tck([[0.00322, 0.00322, 0.00322, 0.00322, 0.01223, 0.018015, 0.021776, 0.029044,0.039417, 0.049519, 0.058012, 0.066234, 0.076747, 0.088337, 0.098714,0.109497, 0.121762, 0.130655, 0.14036, 0.148986, 0.159902, 0.17149,0.179578, 0.189416, 0.200602, 0.208148, 0.217716, 0.228232, 0.239821,0.250063, 0.260845, 0.270818, 0.289145, 0.289145, 0.289145, 0.289145],[0.894574, 0.8607821362959746, 0.7418364422223542, 0.7071594764719331,0.5230593641637336, 0.5053866365045014, 0.4869380604512194,0.40993425463761973, 0.4588732899536263, 0.45115886608796796,0.4672085434114074, 0.45422360120010624, 0.45882234693051327,0.4633823025024543, 0.4785594597978615, 0.45603301615693537,0.46825191653436804, 0.4759245648612374, 0.4816400424293727,0.4467699156979281, 0.4713316096394432, 0.4667017151264001,0.4686302748435692, 0.4597796190662107, 0.445267522727416,0.491034205369033, 0.4641178520412072, 0.46721810151497395,0.46958841021674314, 0.4664976446563455, 0.46420067427943945,0.458894, 0.0, 0.0, 0.0, 0.0],3]);
export let entrance_distance_Harris_obj = (x ) => float(splev(x, entrance_distance_Harris_tck));
export let entrance_distance_methods = ['Rennels', 'Miller', 'Idelchik', 'Harris', 'Crane'];
export let entrance_distance_unrecognized_msg = 'Specified method not recognized; methods are %s' %(entrance_distance_methods);
export function entrance_distance({Di, t=null, l=null, method='Rennels'}) {
    if( method === null ) {
        let method = 'Rennels';
    }
    let t_Di, K;
    if( method === 'Rennels' ) {
        t_Di = t/Di;
        if( t_Di > 0.05 ) {
            t_Di = 0.05;
        }
        return 1.12 + t_Di*(t_Di*(80.0*t_Di + 216.0) - 22.0);
    } else if( method === 'Miller' ) {
        t_Di = t/Di;
        if( t_Di > 0.3 ) {
            t_Di = 0.3;
        }
        return horner(entrance_distance_Miller_coeffs, 20.0/3.0*(t_Di - 0.15));
    } else if( method === 'Idelchik' ) {
        if( l === null ) {
            let l = Di;
        }
        t_Di = Math.min(t/Di, 1.0);
        let l_Di = Math.min(l/Di, 10.0);
        K = float(entrance_distance_Idelchik_obj(l_Di, t_Di));
        if( K < 0.0 ) {
            K = 0.0;
        }
        return K;
    } else if( method === 'Harris' ) {
        let ratio = Math.min(t/Di, 0.289145); // max value for interpolation - extrapolation looks bad
        K = float(entrance_distance_Harris_obj(ratio));
        return K;
    } else if( method === 'Crane' ) {
        return 0.78;
    } else {
        throw new Error( 'ValueError',entrance_distance_unrecognized_msg );
    }
}
export let entrance_distance_45_Miller_coeffs = [1.866792110435199, -2.8873199398381075, -4.814715029513536, 10.49562589373457, 1.40401776402922, -14.035912282651882, 6.576826918678071, 7.854645523152614, -8.044860164646053, -1.1515885154512326, 4.145420152553604, -0.7994793202964967, -1.1034822877774095, 0.32764916637953573, 0.367065452438954, -0.2614447909010587, 0.29084476697430256];
export function entrance_distance_45_Miller({Di, Di0}) {
    let t = 0.5*(Di0 - Di);
    let t_Di = t/Di;
    if( t_Di > 0.3 ) {
        t_Di = 0.3;
    }
    return horner(entrance_distance_45_Miller_coeffs, 6.66666666666666696*(t_Di-0.15));
}
export let entrance_angled_methods = ['Idelchik'];
export let entrance_angled_methods_missing = ('Specified method not recognized; methods are %s'
                                   %(entrance_angled_methods));
export function entrance_angled({angle, method='Idelchik'}) {
    if( method === 'Idelchik' || method === null ) {
        let cos_term = Math.cos(deg2rad*angle);
        return 0.57 + cos_term*(0.2*cos_term + 0.3);
    } else {
        throw new Error( 'ValueError',entrance_angled_methods_missing );
    }
}
export let entrance_rounded_Miller_coeffs = [1.3127209945178038, 0.19963046592715727, -6.49081916725612,-0.10347409377743588, 12.68369791325003, -0.9435681020599904, -12.44320584089916, 1.328251365167716, 6.668390027065714,-0.4356382649470076, -2.209229212394282, -0.07222448354500295,0.6786898049825905, -0.18686362789567468, 0.020064570486606065,-0.013120241146656442, 0.061951596342059975];
export let entrance_rounded_ratios_Idelchik = [0, .01, .02, .03, .04, .05, .06, .08, .12, .16, .2];
export let entrance_rounded_Ks_Idelchik = [.5, .44, .37, .31, .26, .22, .2, .15, .09, .06, .03];
export let entrance_rounded_Idelchik_tck = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.015, 0.025, 0.035, 0.045, 0.055, 0.07, 0.1, 0.14, 0.2, 0.2, 0.2], [0.5, 0.46003224474143023, 0.3682580956033294, 0.30877401146621397, 0.2590978355993873, 0.2166389749374616, 0.19717564973543905, 0.1332971654240214, 0.08659056691519569, 0.05396118560777325, 0.03, 0.0, 0.0, 0.0], 2]);
export let entrance_rounded_Idelchik = (x ) => float(splev(x, entrance_rounded_Idelchik_tck));
export let entrance_rounded_ratios_Crane = [0.0, .02, .04, .06, .1, .15];
export let entrance_rounded_Ks_Crane = [.5, .28, .24, .15, .09, .04];
export let entrance_rounded_ratios_Harris = [0.0, .01, .02, .03, .04, .05, .06, .08, .12, .16];
export let entrance_rounded_Ks_Harris = [.44, .35, .28, .22, .17, .13, .1, .07, .03, 0.0];
export let entrance_rounded_Harris_tck = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.015, 0.025, 0.035, 0.045, 0.055, 0.07, 0.1, 0.16, 0.16, 0.16], [0.44, 0.36435669860605086, 0.2790010365858813, 0.2187082142826953, 0.16874967771794716, 0.1287937194096216, 0.09091157742799895, 0.06354756460434334, 0.01885121769782832, 0.0, 0.0, 0.0, 0.0], 2]);
export let entrance_rounded_Harris = (x ) => float(splev(x, entrance_rounded_Harris_tck));
export let entrance_rounded_methods = ['Rennels', 'Crane', 'Miller', 'Idelchik', 'Harris', 'Swamee'];
export let entrance_rounded_methods_error = ('Specified method not recognized; methods are %s' %(entrance_rounded_methods));
export function entrance_rounded({Di, rc, method='Rennels'}) {
    if( method === null ) {
        let method = 'Rennels';
    }
    let ratio = rc/Di;
    if( method === 'Rennels' ) {
        if( ratio > 1.0 ) {
            return 0.03;
        }
        let lbd = (1.0 - 0.30*Math.sqrt(ratio) - 0.70*ratio);
        lbd *= lbd;
        lbd = 1.0 + 0.622*lbd*lbd;
        return 0.0696*(1.0 - 0.569*ratio)*lbd*lbd + (lbd - 1.0)*(lbd - 1.0);
    } else if( method === 'Swamee' ) {
        return 0.5/(1.0 + 36.0*(ratio)**1.2);
} else if( method === 'Crane' ) {
        if( ratio < 0 ) {
            return 0.5;
        } else if( ratio > 0.15 ) {
            return 0.04;
} else {
            return interp(ratio, entrance_rounded_ratios_Crane,
                          entrance_rounded_Ks_Crane);
        }
} else if( method === 'Miller' ) {
        if( ratio > 0.3 ) {
            ratio = 0.3;
        }
        return horner(entrance_rounded_Miller_coeffs, (20.0/3.0)*(ratio - 0.15));
} else if( method === 'Harris' ) {
        if( ratio > .16 ) {
            return 0.0;
        }
        return float(splev(ratio, entrance_rounded_Harris_tck));
} else if( method === 'Idelchik' ) {
        if( ratio > .2 ) {
            return entrance_rounded_Ks_Idelchik[-1];
        }
        return float(splev(ratio, entrance_rounded_Idelchik_tck));
} else {
        throw new Error( 'ValueError',entrance_rounded_methods_error );
    }
}
export let entrance_beveled_methods = ['Rennels', 'Idelchik'];
export let entrance_beveled_methods_unknown_msg = 'Specified method not recognized; methods are %s' %entrance_beveled_methods;
export let entrance_beveled_Idelchik_l_Di = [0.025, 0.05, 0.075, 0.1, 0.15, 0.6];
export let entrance_beveled_Idelchik_angles = [0.0, 10.0, 20.0, 30.0, 40.0, 60.0, 100.0, 140.0, 180.0];
export let entrance_beveled_Idelchik_dat = [ [0.5, 0.47, 0.45, 0.43, 0.41, 0.4, 0.42, 0.45, 0.5], [0.5, 0.45, 0.41, 0.36, 0.33, 0.3, 0.35, 0.42, 0.5], [0.5, 0.42, 0.35, 0.3, 0.26, 0.23, 0.3, 0.4, 0.5], [0.5, 0.39, 0.32, 0.25, 0.22, 0.18, 0.27, 0.38, 0.5], [0.5, 0.37, 0.27, 0.2, 0.16, 0.15, 0.25, 0.37, 0.5], [0.5, 0.27, 0.18, 0.13, 0.11, 0.12, 0.23, 0.36, 0.5]];
// TODO: check named arguments
// let entrance_beveled_Idelchik_tck = tck_interp2d_linear(entrance_beveled_Idelchik_angles, entrance_beveled_Idelchik_l_Di, entrance_beveled_Idelchik_dat, kx=1, ky=1);
export let entrance_beveled_Idelchik_tck = tck_interp2d_linear(entrance_beveled_Idelchik_angles, entrance_beveled_Idelchik_l_Di, entrance_beveled_Idelchik_dat, 1, 1);
export let entrance_beveled_Idelchik_obj = (x, y ) => float(bisplev(x, y, entrance_beveled_Idelchik_tck));
export function entrance_beveled({Di, l, angle, method='Rennels'}) {
    if( method === null ) {
        let method = 'Rennels';
    }
    if( method === 'Rennels' ) {
        let Cb = (1-angle/90.)*(angle/90.)**(1./(1 + l/Di ));
        let lbd = 1 + 0.622*(1 - 1.5*Cb*(l/Di)**((1 - Math.sqrt(Math.sqrt(l/Di)))/2.));
        return 0.0696*(1 - Cb*l/Di)*lbd**2 + (lbd - 1.)**2;
    } else if( method === 'Idelchik' ) {
        return float(bisplev(angle*2.0, l/Di, entrance_beveled_Idelchik_tck));
} else {
        throw new Error( 'ValueError',entrance_beveled_methods_unknown_msg );
    }
}
export function entrance_beveled_orifice({Di, Do, l, angle}) {
    let Cb = (1-angle/90.)*(angle/90.)**(1./(1 + l/Do ));
    let lbd = 1 + 0.622*(1 - Cb*(l/Do)**((1 - Math.sqrt(Math.sqrt(l/Do)))/2.));
    return 0.0696*(1 - Cb*l/Do)*lbd**2 + (lbd - (Do/Di)**2)**2;
}
////// Exits
export function exit_normal() {
    return 1.0;
}
////// Bends
let tck_bend_rounded_Miller = implementation_optimize_tck([[0.500967, 0.500967, 0.500967, 0.500967, 0.5572659504420276, 0.6220535279438968, 0.6876695918008857, 0.8109956990835443, 0.8966138996017785, 1.0418136796591293, 1.2129808986390955, 1.4328097893561944, 2.684491977649823, 3.496050493509287, 4.245254058334557, 10.0581, 10.0581, 10.0581, 10.0581], [10.0022, 10.0022, 10.0022, 10.0022, 26.661576730080427, 35.71142422728946, 46.22896414495794, 54.476944091380965, 67.28681897720492, 79.96560467244989, 88.89484575805731, 104.37345376723293, 113.75217318286595, 121.36638011164008, 139.53481668808192, 180.502, 180.502, 180.502, 180.502], [0.02844925354339322, 0.032368056788003474, 0.06341726367587057, 0.18372991235687228, 0.27828335685928296, 0.4184452895626468, 0.5844709012848479, 0.8517327028006999, 1.0883889837806633, 1.003595822015052, 1.2959349743905006, 1.3631701864169843, 3.2579960738248563, 8.188259745620396, 6.370167194425542, 0.026614405579949103, 0.03578575879432178, 0.05399131725104529, 0.17357295746658216, 0.2597698136964017, 0.384398460262134, 0.5537955210508835, 0.842964805734998, 1.1076060802420074, 1.0500502914944205, 1.2160489773171173, 1.2940140217639442, 2.5150913200614293, 5.987790923112488, 4.791049223949247, 0.026866783841898684, 0.03061409809632371, 0.054698306220358, 0.14037162784411245, 0.23981090432386729, 0.31617091309760137, 0.47435842573782666, 0.7484605121106159, 0.9223888516911868, 1.0345139221619066, 1.0709769967277933, 1.1489283659291687, 1.4249255928619116, 2.6908421883082823, 2.3898833324508804, 0.019707980719056793, 0.03350958504709355, 0.0457699204936841, 0.1180773988295937, 0.18163838540491214, 0.2955424583244998, 0.3178086095370295, 0.54907384767895, 0.7497276995283433, 0.8353766950608585, 0.8907203653185313, 0.941376749552297, 0.8755423259796333, 0.8987849646797164, 0.9905785504810203, 0.018632197087313764, 0.0275473376021632, 0.046686663726990756, 0.09334625398868963, 0.15009471210360348, 0.21438462374865175, 0.310541469358518, 0.27652184608845864, 0.4703245212932829, 0.5612926929410017, 0.6344189573543495, 0.6897616299237337, 0.8553230255854581, 0.8050040042565408, 0.7800498994134173, 0.017040716941189974, 0.027163747207842776, 0.04233976165781228, 0.08546809847236579, 0.11872359104267481, 0.1748602349243538, 0.248787221592314, 0.3166892465009758, 0.2894990945943436, 0.35635089905047324, 0.3942719381041552, 0.4019846022857163, 0.4910888827789205, 0.4424331343990761, 0.5367477778555589, 0.017232689797500957, 0.024595005629126976, 0.04235982677436609, 0.0748705682747817, 0.11096283696103083, 0.13900984487771062, 0.18773056195495877, 0.2400721832034611, 0.28581377924973544, 0.282839816159864, 0.2907117502580411, 0.3035848810896592, 0.31268019467513564, 0.3365050687225188, 0.2836774098946595, 0.017462451480157917, 0.02373981127475937, 0.04248526591300313, 0.07305722078054935, 0.09424065630357203, 0.13682400355164548, 0.15020534827616405, 0.2100221959547714, 0.23136495625582817, 0.24417894312621574, 0.2505645472554214, 0.24143469557592281, 0.24722191256497117, 0.2195110087547775, 0.29557609063213136, 0.017605444779345832, 0.026265210174737128, 0.0445497171166642, 0.07254637551095446, 0.08779690828578819, 0.11992614224260065, 0.14501268843599757, 0.17386066713179812, 0.21657094190224363, 0.21594544490951023, 0.22661999176624517, 0.23759356544596819, 0.23887614636323537, 0.25802515101229484, 0.20566480389514516, 0.01928450591486404, 0.03264367752872495, 0.05391006363370407, 0.07430728218140033, 0.08818045730326454, 0.09978389535000864, 0.12544634357734885, 0.13365159719049172, 0.15802979203343911, 0.17543365869590444, 0.17531453508236272, 0.1706085325985479, 0.15983319357859727, 0.16872558079206196, 0.19799750352823683, 0.020835891827102552, 0.047105767455498285, 0.05307639179638059, 0.07839236342751181, 0.09519829368423402, 0.10189528661430994, 0.12852821694010982, 0.13195311029179943, 0.1594822363328695, 0.15660304273110143, 0.15934161651984413, 0.17702957118830723, 0.1892675345030034, 0.19710951153945122, 0.1897835097361326, 0.031571285288316195, 0.04810266172763896, 0.05660304311192384, 0.09317293919692342, 0.08967028392412497, 0.12028974875677166, 0.1182836264474129, 0.13845925262729528, 0.15739100571169004, 0.17649056196464383, 0.20171423738165223, 0.20947832805305883, 0.22837004534830094, 0.23661874048689152, 0.24537433391842686, 0.042992073811512765, 0.045958026954244176, 0.08988351069774198, 0.08320361205549355, 0.1253881915447805, 0.12765039447605908, 0.1632907944306065, 0.17922551055575348, 0.20436939408609628, 0.23133806857897737, 0.22837190631962206, 0.2611718034649056, 0.30462224139228183, 0.3277471634644065, 0.3595577208662931, 0.042671097083349346, 0.06027193387363409, 0.07182684474072856, 0.12072547771177115, 0.1331787059163636, 0.16137414417679433, 0.1780034002291815, 0.19820571860540606, 0.2294059556234193, 0.23221403415772682, 0.2697708431035234, 0.2813760107306456, 0.28992333749905363, 0.3650401400682786, 0.8993207970132076, 0.045660964207664585, 0.06299599466264151, 0.09193684371316964, 0.12747145786167088, 0.14606550538249963, 0.172664884028299, 0.19152378303841075, 0.2212007207927944, 0.23752800077573005, 0.26289800433018995, 0.2772198641539113, 0.2995308585350757, 0.3549459028594012, 0.8032461437896778, 3.330618601208751], 3, 3]);
export let bend_rounded_Miller_Kb = (rc_D, angle ) => float(bisplev(rc_D, angle, tck_bend_rounded_Miller));
let tck_bend_rounded_Miller_C_Re = implementation_optimize_tck([[4.0, 4.0, 4.0, 4.0, 8.0, 8.0, 8.0, 8.0], [1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0], [2.177340320782947, 2.185952396281732, 2.185952396281732, 2.1775876405173977, 0.6513348082098823, 0.7944713057222101, 0.7944713057222103, 1.0526247737400114, 0.6030278030721317, 1.3741240162063968, 1.3741240162063992, 0.7693594604301893, -2.1663631289607883, -1.9474318981548622, -1.9474318981548622, 0.4196741237602154], 3, 3]);
export let bend_rounded_Miller_C_Re = (Re, rc_D ) => float(bisplev(Math.log10(Re), rc_D, tck_bend_rounded_Miller_C_Re));
export let bend_rounded_Miller_C_Re_limit_1 = [2428087.757821312, -13637184.203693766, 28450331.830760233, -25496945.91463643, 8471761.477755375];
let tck_bend_rounded_Miller_C_o_0_1 = implementation_optimize_tck([[9.975803953769495e-06, 9.975803953769495e-06, 9.975803953769495e-06, 9.975803953769495e-06, 0.5259485989276764, 1.3157845547408782, 3.220104449183945, 6.133677908951886, 30.260656153593906, 30.260656153593906, 30.260656153593906, 30.260656153593906], [0.6179524338907976, 0.6000479624108129, 0.49299050530751654, 0.4820011733402483, 0.5584830305084972, 0.7496716557444135, 0.8977538553873484, 0.9987218804089956, 0.0, 0.0, 0.0, 0.0], 3]);
let tck_bend_rounded_Miller_C_o_0_15 = implementation_optimize_tck([[0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.26429667728434275, 0.5188174292838083, 1.469212480387932, 4.269571348168375, 13.268280073552294, 26.28093462852014, 26.28093462852014, 26.28093462852014, 26.28093462852014], [0.8691924906711972, 0.8355177386350426, 0.7617588987656675, 0.5853012015918869, 0.5978128647571033, 0.7366100253604377, 0.8229203841913866, 0.9484887080989913, 1.0003643259424702, 0.0, 0.0, 0.0, 0.0], 3]);
let tck_bend_rounded_Miller_C_o_0_2 = implementation_optimize_tck([[-0.001273275512351991, -0.001273275512351991, -0.001273275512351991, -0.001273275512351991, 0.36379835796750504, 0.7789151587713531, 1.7319487323386349, 3.559883175039053, 22.10600230228466, 22.10600230228466, 22.10600230228466, 22.10600230228466], [1.2055892891232, 1.1810797953131011, 0.8556056552110055, 0.6595884323229468, 0.6669634037761268, 0.8636791463334055, 0.8855712717206472, 0.9992625616471772, 0.0, 0.0, 0.0, 0.0], 3]);
let tck_bend_rounded_Miller_C_o_0_25 = implementation_optimize_tck([[0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.2765978180291006, 0.5010875816968301, 0.6395222359284018, 0.661563946104784, 0.6887462820881093, 0.7312909084975013, 0.7605490601821624, 0.8078652661481783, 0.8553090397903271, 1.024376958429362, 1.4748577103270428, 2.052843716337269, 3.9670225184835175, 6.951737782758053, 16.770001745987884, 16.770001745987884, 16.770001745987884, 16.770001745987884], [2.7181584441006414, 2.6722855229796196, 2.510271857479865, 2.162580617260359, 1.8234805515473758, 1.5274137403431902, 1.3876379087140025, 1.2712745614209848, 1.1478416325256429, 1.015542018903243, 0.8445749706812837, 0.7368799268423506, 0.7061205857035833, 0.7381928947255646, 0.7960778489514514, 0.878729192230999, 0.9281388590439098, 0.9825611959699471, 0.0, 0.0, 0.0, 0.0], 3]);
let tck_bend_rounded_Miller_C_o_1_0 = implementation_optimize_tck([[0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.0025931401409935687, 0.4940382602529053, 0.7383107558560895, 0.8929948619544391, 0.9910262538499016, 1.1035407055233972, 1.2685727302009009, 2.190931635360523, 3.718073594472333, 6.026458907878363, 13.268280073552294, 13.268280073552294, 13.268280073552294, 13.268280073552294], [2.713127433391318, 2.6799201583608965, 2.4446034702691906, 2.0505313661892837, 1.7853408404592677, 1.5802763594858027, 1.395503315683405, 1.0504150726350026, 0.9294800209596744, 0.8937523212160566, 0.9339124388590752, 0.9769117997985829, 0.9948478073955791, 0.0, 0.0, 0.0, 0.0], 3]);
let tck_bend_rounded_Miller_C_os = (tck_bend_rounded_Miller_C_o_0_1, tck_bend_rounded_Miller_C_o_0_15, tck_bend_rounded_Miller_C_o_0_2, tck_bend_rounded_Miller_C_o_0_25, tck_bend_rounded_Miller_C_o_1_0);
export let bend_rounded_Miller_C_o_Kbs = [.1, .15, .2, .25, 1];
export let bend_rounded_Miller_C_o_limits = [30.260656153593906, 26.28093462852014, 22.10600230228466, 16.770001745987884, 13.268280073552294];
export let bend_rounded_Miller_C_o_limit_0_01 = [0.6169055099514943, 0.8663244713199465, 1.2029584898712695, 2.7143438886138744, 2.7115417734646114];
export function Miller_bend_roughness_correction({Re, Di, roughness}) {
    // Section 9.2.4 - Roughness correction
    // Re limited to under 1E6 in friction factor falculations
    // Use a cached smooth fd value if Re too high
    let Re_fd_min = Math.min(1E6, Re);
    let fd_smoth;
    if( Re_fd_min < 1E6 ) {
        fd_smoth = friction_factor( {Re: Re_fd_min, eD: 0.0 });
    } else {
        fd_smoth = 0.011645040997991626;
    }
    let fd_rough = friction_factor( {Re: Re_fd_min, eD: roughness/Di });
    let C_roughness = fd_rough/fd_smoth;
    return C_roughness;
}
export function Miller_bend_unimpeded_correction({Kb, Di, L_unimpeded}) {
    /*Limitations as follows:
    * Ratio not over 30
    * If ratio under 0.01, tabulated values are used near the limits
      (discontinuity in graph anyway)
    * If ratio for a tried curve larger than max value, max value is used
      instead of calculating it
    * Kb limited to between 0.1 and 1.0
    * When between two Kb curves, interpolate linearly after evaluating both
      splines appropriately
    */
    let Kb_C_o;
    if( Kb < 0.1 ) {
        Kb_C_o = 0.1;
    } else if( Kb > 1 ) {
        Kb_C_o = 1.0;
} else {
        Kb_C_o = Kb;
    }
    let L_unimpeded_ratio = L_unimpeded/Di;
    if( L_unimpeded_ratio > 30 ) {
        L_unimpeded_ratio = 30.0;
    }
    for( let i of range(len(bend_rounded_Miller_C_o_Kbs)) ) {
        let Kb_low = bend_rounded_Miller_C_o_Kbs[i];
        let Kb_high = bend_rounded_Miller_C_o_Kbs[i+1];
        if( Kb_low <= Kb_C_o <= Kb_high ) {
            let Co_low;
            if( L_unimpeded_ratio >= bend_rounded_Miller_C_o_limits[i] ) {
                Co_low = 1.0;
            } else if( L_unimpeded_ratio <= 0.01 ) {
                Co_low = bend_rounded_Miller_C_o_limit_0_01[i];
} else {
                Co_low = float(splev(L_unimpeded_ratio, tck_bend_rounded_Miller_C_os[i]));
            }
            if( L_unimpeded_ratio >= bend_rounded_Miller_C_o_limits[i+1] ) {
                let Co_high = 1.0;
            } else if( L_unimpeded_ratio <= 0.01 ) {
                Co_high = bend_rounded_Miller_C_o_limit_0_01[i+1];
} else {
                Co_high = float(splev(L_unimpeded_ratio, tck_bend_rounded_Miller_C_os[i+1]));
            }
            let C_o = Co_low + (Kb_C_o - Kb_low)*(Co_high - Co_low)/(Kb_high - Kb_low);
            return C_o;
        }
    }
}
export function bend_rounded_Miller({Di, angle, Re, rc=null, bend_diameters=null,
                        roughness=0.0, L_unimpeded=null}) {
    if( rc === null ) {
        if( bend_diameters === null ) {
            let bend_diameters = 5.0;
        }
        let rc = Di*bend_diameters;
    }
    let radius_ratio = rc/Di;
    if( L_unimpeded === null ) {
        // Assumption - smooth outlet
        let L_unimpeded = 20.0*Di;
    }
    if( radius_ratio < 0.5 ) {
        radius_ratio = 0.5;
    }
    if( radius_ratio > 10.0 ) {
        radius_ratio = 10.0;
    }
    if( angle < 10.0 ) {
        angle = 10.0;
    }
    let Kb = bend_rounded_Miller_Kb(radius_ratio, angle);
    let C_roughness = Miller_bend_roughness_correction( {Re: Re, Di: Di,
                                                   roughness: roughness });
    /*Section 9.2.2 - Reynolds Number Correction
    Allow some extrapolation up to 1E8 (1E7 max in graph but the trend looks good)
    */
    let Re_C_Re = Math.min(Math.max(Re, 1E4), 1E8);
    if( radius_ratio >= 2.0 ) {
        if( Re_C_Re === 1E8 ) {
            let C_Re = 0.4196741237602154; // bend_rounded_Miller_C_Re(1e8, 2.0)
        } else if( Re_C_Re === 1E4 ) {
            C_Re = 2.1775876405173977; // bend_rounded_Miller_C_Re(1e4, 2.0)
} else {
            C_Re = bend_rounded_Miller_C_Re(Re_C_Re, 2.0);
        }
    } else if( radius_ratio <= 1.0 ) {
        // newton(lambda x: bend_rounded_Miller_C_Re(x, 1.0)-1, 2e5) to get the boundary value
        let C_Re_1 = Re_C_Re < 207956.58904584477 ? bend_rounded_Miller_C_Re(Re_C_Re, 1.0) : 1.0;
        if( radius_ratio > 0.7 || Kb < 0.4 ) {
            C_Re = C_Re_1;
        } else {
            C_Re = Kb/(Kb - 0.2*C_Re_1 + 0.2);
            if( C_Re > 2.2 || C_Re < 0 ) {
                C_Re = 2.2;
            }
        }
} else {
        // regardless of ratio - 1
        if( Re_C_Re > 1048884.4656835075 ) {
            C_Re = 1.0;
        } else if( Re_C_Re > horner(bend_rounded_Miller_C_Re_limit_1, radius_ratio) ) {
            C_Re = 1.0;
}//            ps = np.linspace(1, 2)
//            qs = [secant(lambda x: bend_rounded_Miller_C_Re(x, i)-1, 2e5) for i in ps]
//            np.polyfit(ps, qs, 4).tolist()
            // Line of C_Re=1 as a function of r_d between 0 and 1
 else {
            C_Re = bend_rounded_Miller_C_Re(Re_C_Re, radius_ratio);
        }
    }
    let C_o =  Miller_bend_unimpeded_correction( {Kb: Kb, Di: Di, L_unimpeded: L_unimpeded });
//    print('Kb=%g, C Re=%g, C rough =%g, Co=%g' %(Kb, C_Re, C_roughness, C_o))
    return Kb*C_Re*C_roughness*C_o;
}
export let bend_rounded_Crane_ratios = [1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 20.0];
export let bend_rounded_Crane_fds = [20.0, 14.0, 12.0, 12.0, 14.0, 17.0, 24.0, 30.0, 34.0, 38.0, 42.0, 50.0];
export let bend_rounded_Crane_coeffs = [111.75011378177442, -331.89911345404107, -27.841951521656483, 1066.8916917931147, -857.8702190626232, -1151.4621655498092, 1775.2416673594603, 216.37911821941805, -1458.1661519377653, 447.169127650163, 515.361158769082, -322.58377486107577, -38.38349416327068, 71.12796602489138, -16.198233745350535, 19.377150177339015, 31.107110520349494];
export function bend_rounded_Crane({Di, angle, rc=null, bend_diameters=null}) {
    if( (rc !== null && bend_diameters !== null) ) { // numba: delete
        if( abs(Di*bend_diameters/rc - 1.0) > 1e-12 ) { // numba: delete
            throw new Error( 'ValueError',"Cannot specify both `rc` and `bend_diameters`" ); // numba: delete
        }
    }
    if( rc === null ) {
        if( bend_diameters === null ) {
            let bend_diameters = 5.0;
        }
        let rc = Di*bend_diameters;
    }
    let fd = ft_Crane(Di);
    let radius_ratio = rc/Di;
    if( radius_ratio < 1.0 ) {
        radius_ratio = 1.0;
    } else if( radius_ratio > 20.0 ) {
        radius_ratio = 20.0;
}
    let factor = horner(bend_rounded_Crane_coeffs, 0.105263157894736836*(radius_ratio - 10.5));
    let K = fd*factor;
    K = (angle/90.0 - 1.0)*(0.25*Math.PI*fd*radius_ratio + 0.5*K) + K;
    return K;
}
let _Ito_angles = [45.0, 90.0, 180.0];
export function bend_rounded_Ito({Di, angle, Re, rc=null, bend_diameters=null,
                     roughness=0.0}) {
    /*Ito method as shown in Blevins.
    Curved friction factor as given in Blevins, with minor tweaks to be more
    accurate to the original methods.
    */
    if( !rc ) {
        if( bend_diameters === null ) {
            let bend_diameters = 5.0;
        }
        let rc = Di*bend_diameters;
    }
    let radius_ratio = rc/Di;
    let angle_rad = radians(angle);
    let De2 = Re*(Di/rc)**2.0;
    if( rc > 50.0*Di ) {
        let alpha = 1.0;
    } else {
        // Alpha is up to 6, as ratio gets higher, can go down to 1
        let alpha_45 = 1.0 + 5.13*(Di/rc)**1.47;
        let alpha_90 = rc/Di < 9.85 ? 0.95 + 4.42*(Di/rc)**1.96 : 1.0;
        let alpha_180 = 1.0 + 5.06*(Di/rc)**4.52;
        alpha = interp(angle, _Ito_angles, [alpha_45, alpha_90, alpha_180]);
    }
    if( De2 <= 360.0 ) {
        let fc = friction_factor_curved( {Re: Re, Di: Di, Dc: 2.0*rc,
                                    roughness: roughness,
                                    Rec_method: 'Srinivasan',
                                    laminar_method: 'White',
                                    turbulent_method: 'Srinivasan turbulent' });
        let K = 0.0175*alpha*fc*angle*rc/Di;
    } else {
        K = 0.00431*alpha*angle*Re**-0.17*(rc/Di)**0.84;
    }
    return K;
}
let crane_standard_bend_angles = [45.0, 90.0, 180.0];
let crane_standard_bend_losses = [16.0, 30.0, 50.0];
export let bend_rounded_methods = ['Rennels', 'Crane', 'Crane standard', 'Miller', 'Swamee', 'Ito'];
export let bend_rounded_method_unknown = 'Specified method not recognized; methods are %s' %(bend_rounded_methods);
export function bend_rounded({Di, angle, fd=null, rc=null, bend_diameters=null,
                 Re=null, roughness=0.0, L_unimpeded=null, method='Rennels'}) {
    if( method === null ) {
        let method = 'Rennels';
    }
    if( bend_diameters === null && rc === null ) {
        let bend_diameters = 5.0;
    }
    if( rc === null ) {
        let rc = Di*bend_diameters;
    }
    if( method === 'Rennels' ) {
        angle = radians(angle);
        if( fd === null ) {
            if( Re === null ) {
                throw new Error( 'ValueError',"The `Rennels` method requires either a specified friction factor or `Re`" );
            }
            let fd = Clamond( {Re: Re, eD: roughness/Di, fast: false });
        }
        let sin_term = Math.sin(0.5*angle);
        return (fd*angle*rc/Di + (0.10 + 2.4*fd)*sin_term
        + 6.6*fd*(Math.sqrt(sin_term) + sin_term)/(rc/Di)**(4.*angle/Math.PI));
    } else if( method === 'Miller' ) {
        if( Re === null ) {
            throw new Error( 'ValueError','Miller method requires Reynolds number' );
        }
        return bend_rounded_Miller( {Di: Di, angle: angle, Re: Re, rc: rc,
                                   bend_diameters: bend_diameters,
                                   roughness: roughness,
                                   L_unimpeded: L_unimpeded });
} else if( method === 'Crane' ) {
        return bend_rounded_Crane( {Di: Di, angle: angle, rc: rc,
                                  bend_diameters: bend_diameters });
} else if( method === 'Crane standard' ) {
        return ft_Crane(Di)*interp(angle, crane_standard_bend_angles, crane_standard_bend_losses, { extrapolate: true });
} else if( method === 'Ito' ) {
        if( Re === null ) {
            throw new Error( 'ValueError',"The `Iso` method requires`Re`" );
        }
        return bend_rounded_Ito( {Di: Di, angle: angle, Re: Re, rc: rc, bend_diameters: bend_diameters,
                     roughness: roughness });
} else if( method === 'Swamee' ) {
        return (0.0733 + 0.923*(Di/rc)**3.5)*Math.sqrt(radians(angle));
} else {
        throw new Error( 'ValueError',bend_rounded_method_unknown );
    }
}
export let bend_miter_Miller_coeffs = [-12.050299402650126, -4.472433689233185, 50.51478860493546, 18.246302079077196, -84.61426660754049, -28.9340865412371, 71.07345367553872, 21.354010992349565, -30.239604839338, -5.855129345095336, 5.465131779316523, -1.0881363712712555, -0.3635431075401224, 0.5120065303391261, 0.46818214491579246, 0.9789177645343993, 0.5080285124448385];
export function bend_miter_Miller({Di, angle, Re, roughness=0.0, L_unimpeded=null}) {
    if( L_unimpeded === null ) {
        let L_unimpeded = 20.0*Di;
    }
    if( angle > 120.0 ) {
        angle = 120.0;
    }
    let Kb = horner(bend_miter_Miller_coeffs, 1.0/60.0*(angle-60.0));
    let C_o =  Miller_bend_unimpeded_correction( {Kb: Kb, Di: Di, L_unimpeded: L_unimpeded });
    let C_roughness = Miller_bend_roughness_correction( {Re: Re, Di: Di,
                                                   roughness: roughness });
    let Re_C_Re = Math.min(Math.max(Re, 1E4), 1E8);
    let C_Re_1 = Re_C_Re < 207956.58904584477 ? bend_rounded_Miller_C_Re(Re_C_Re, 1.0) : 1.0;
    let C_Re = Kb/(Kb - 0.2*C_Re_1 + 0.2);
    if( C_Re > 2.2 || C_Re < 0 ) {
        C_Re = 2.2;
    }
    return Kb*C_Re*C_roughness*C_o;
}
export let bend_miter_Crane_angles = [0.0, 15.0, 30.0, 45.0, 60.0, 75.0, 90.0];
export let bend_miter_Crane_fds = [2.0, 4.0, 8.0, 15.0, 25.0, 40.0, 60.0];
export let bend_miter_Blevins_angles = [0.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 120.0];
export let bend_miter_Blevins_Ks = [0.0, .025, .055, .1, .2, .35, .5, .7, .9, 1.1, 1.5];
export let bend_miter_methods = ['Rennels', 'Miller', 'Crane', 'Blevins'];
export let bend_miter_method_unknown_msg = 'Specified method not recognized; methods are %s' %(bend_miter_methods);
export function bend_miter({angle, Di=null, Re=null, roughness=0.0, L_unimpeded=null,
               method='Rennels'}) {
    if( method === null ) {
        let method = 'Rennels';
    }
    if( method === 'Rennels' ) {
        let angle_rad = radians(angle);
        let sin_half_angle = Math.sin(angle_rad*0.5);
        return 0.42*sin_half_angle + 2.56*sin_half_angle*sin_half_angle*sin_half_angle;
    } else if( method === 'Crane' ) {
        let factor = interp(angle, bend_miter_Crane_angles, bend_miter_Crane_fds);
        return ft_Crane(Di)*factor;
} else if( method === 'Miller' ) {
        return bend_miter_Miller( {Di: Di, angle: angle, Re: Re, roughness: roughness, L_unimpeded: L_unimpeded });
} else if( method === 'Blevins' ) {
        // data from Idelchik, Miller, an earlier ASME publication
        // For 90-120 degrees, a polynomial/spline would be better than a linear fit
        let K_base = interp(angle, bend_miter_Blevins_angles, bend_miter_Blevins_Ks);
        return K_base*(2E5/Re)**0.2;
} else {
        throw new Error( 'ValueError',bend_miter_method_unknown_msg );
    }
}
export function helix({Di, rs, pitch, N, fd}) {
    return N*(fd*Math.sqrt((2*Math.PI*rs)**2 + pitch**2)/Di + 0.20 + 4.8*fd);
}
export function spiral({Di, rmax, rmin, pitch, fd}) {
    return (rmax-rmin)/pitch*(fd*Math.PI*(rmax+rmin)/Di + 0.20 + 4.8*fd) + 13.2*fd/(rmin/Di)**2;
}
////// Contractions
let tck_contraction_abrupt_Miller = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.0, 0.5553844358576507, 0.7193937784550933, 0.8144518359319883, 1.0, 1.0, 1.0, 1.0],[0.0, 0.0, 0.0, 0.0, 0.008318525134414716, 0.03421785904690331, 0.1, 0.1, 0.1, 0.1],[0.4994829280256306, 0.4879234090312588, 0.4255534701302917, 0.13986792857000196, 0.18065199312360336,0.08701863105570044, 0.440886271558411, 0.4243716649409474, 0.36030826702480984, 0.2117960027770777,0.11248601502220595, 0.08616608643911047, 0.4018850813314268, 0.3706136100344715, 0.26368725187530173,0.15316562777200723, 0.09856904494833027, 0.08399367477431015, 0.17005190739488515, 0.16023910724406945,0.1242906181281536, 0.06137573180850665, 0.05726821990215439, 0.04684229988854647, 0.03922553704852396,0.036955938945600654, 0.029450340285188167, 0.028656302938315878, 0.019588760093397686, 0.01950497484044149,0.006447273360860872, 0.006569278508667471, 0.0053786079483153885, -0.013158950566037957,0.010870991979047888, 0.0015100946100218284, -0.0005221250682760256, -0.0006447517875307877,-0.0007846123907797336, 0.0024459067063225485, -0.0019102888752274472, -0.0001356300464508266],3, 3]);
export function contraction_round_Miller({Di1, Di2, rc}) {
    let A_ratio = Di2*Di2/(Di1*Di1);
    let radius_ratio = rc/Di2;
    if( radius_ratio > 0.1 ) {
        radius_ratio = 0.1;
    }
    let Ks = float(bisplev(A_ratio, radius_ratio, tck_contraction_abrupt_Miller));
    // For some near-1 ratios, can get negative Ks due to the spline.
    if( Ks < 0.0 ) {
        Ks = 0.0;
    }
    return Ks;
}
export let contraction_sharp_methods = ['Rennels', 'Hooper', 'Crane'];
export let contraction_sharp_method_unknown = 'Specified method not recognized; methods are %s' %(contraction_sharp_methods);
export function contraction_sharp({Di1, Di2, fd=null, Re=null, roughness=0.0,
                      method='Rennels'}) {
    if( method === 'Rennels' ) {
        let beta = Di2/Di1;
        let beta2 = beta*beta;
        let beta5 = beta2*beta2*beta;
        let lbd = 1.0 + 0.622*(1.0 - 0.215*beta2 - 0.785*beta5);
        return 0.0696*(1.0 - beta5)*lbd*lbd + (lbd - 1.0)*(lbd - 1.0);
    } else if( method === 'Hooper' ) {
        if( Re === null ) {
            throw new Error( 'ValueError',"Hooper method requires `Re`" );
        }
        let D1_D2 = Di1/Di2;
        let D1_D2_2 = D1_D2*D1_D2;
        if( Re <= 2500.0 ) {
            let K = (1.2 + 160.0/Re)*(D1_D2_2*D1_D2_2 - 1.0);
        } else {
            if( fd === null ) {
                let fd = Clamond( {Re: Re, eD: roughness/Di1 });
            }
            K = (0.6 + 0.48*fd)*D1_D2_2*(D1_D2_2 - 1.0);
        }
        K = change_K_basis(K, Di1, Di2);
        return K;
} else if( method === 'Crane' ) {
        return contraction_conical_Crane(Di1, Di2, { l: 0.0 });
} else {
        throw new Error( 'ValueError',contraction_sharp_method_unknown );
    }
}
export let contraction_round_Idelchik_ratios = [0.0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.12, 0.16, 0.2];
export let contraction_round_Idelchik_factors = [0.5, 0.43, 0.37, 0.31, 0.26, 0.22, 0.20, 0.15, 0.09, 0.06, 0.03];
// Third factor is 0.36 in 1960 edition, 0.37 in Design Guide
export let contraction_round_methods = ['Rennels', 'Miller', 'Idelchik'];
export let contraction_round_unknown_method = 'Specified method not recognized; methods are %s' %(contraction_round_methods);
export function contraction_round({Di1, Di2, rc, method='Rennels'}) {
    let beta = Di2/Di1;
    if( method === null ) {
        let method = 'Rennels';
    }
    if( method === 'Rennels' ) {
        let lbd = 1.0 + 0.622*(1.0 - 0.30*Math.sqrt(rc/Di2) - 0.70*rc/Di2)**4*(1.0 - 0.215*beta**2 - 0.785*beta**5);
        return 0.0696*(1.0 - 0.569*rc/Di2)*(1.0 - Math.sqrt(rc/Di2)*beta)*(1.0 - beta**5)*lbd*lbd + (lbd - 1.0)**2;
    } else if( method === 'Miller' ) {
        return contraction_round_Miller( {Di1: Di1, Di2: Di2, rc: rc });
} else if( method === 'Idelchik' ) {
        // Di2, ratio defined in terms over diameter
        let K0 = interp(rc/Di2, contraction_round_Idelchik_ratios,
                    contraction_round_Idelchik_factors);
        return K0*(1.0 - beta*beta);
} else {
        throw new Error( 'ValueError',contraction_round_unknown_method );
    }
}
export function contraction_conical_Crane({Di1, Di2, l=null, angle=null}) {
    if( l !== null ) {
        if( l === 0.0 ) {
            let angle_rad = Math.PI;
        } else {
            angle_rad = 2.0*Math.atan((Di1-Di2)/(2.0*l));
        }
    } else if( angle !== null ) {
        angle_rad = deg2rad*angle;
}        //l = (Di1 - Di2)/(2.0*Math.tan(0.5*angle)) # L is not needed in this calculation
 else {
        throw new Error( 'ValueError','One of `l` or `angle` must be specified' );
    }
    let beta = Di2/Di1;
    let beta2 = beta*beta;
    if( angle_rad < 0.25*Math.PI ) {
        // Formula 1
        let K2 = 0.8*Math.sin(0.5*angle_rad)*(1.0 - beta2);
    } else {
        // Formula 2
        K2 = 0.5*(Math.sqrt(Math.sin(0.5*angle_rad))*(1.0 - beta2));
    }
    return K2;
}
export let contraction_conical_angles_Idelchik = [2, 3, 6, 8, 10, 12, 14, 16, 20];
export let contraction_conical_A_ratios_Idelchik = [0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6];
export let contraction_conical_friction_Idelchik = [[0.14, 0.1, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01],[0.14, 0.1, 0.05, 0.04, 0.03, 0.02, 0.02, 0.02, 0.01],[0.14, 0.1, 0.05, 0.04, 0.03, 0.02, 0.02, 0.02, 0.01],[0.14, 0.1, 0.05, 0.04, 0.03, 0.02, 0.02, 0.02, 0.01],[0.14, 0.1, 0.05, 0.03, 0.03, 0.02, 0.02, 0.02, 0.01],[0.14, 0.1, 0.05, 0.03, 0.03, 0.02, 0.02, 0.02, 0.01],[0.13, 0.09, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.01],[0.12, 0.08, 0.04, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01],[0.11, 0.07, 0.04, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01],[0.09, 0.06, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.01]];
// TODO: check named arguments
// let contraction_conical_frction_Idelchik_tck = tck_interp2d_linear(contraction_conical_angles_Idelchik, contraction_conical_A_ratios_Idelchik, contraction_conical_friction_Idelchik, kx=1, ky=1);
export let contraction_conical_frction_Idelchik_tck = tck_interp2d_linear(contraction_conical_angles_Idelchik, contraction_conical_A_ratios_Idelchik, contraction_conical_friction_Idelchik, 1, 1);
export let contraction_conical_frction_Idelchik_obj = (x, y ) => float(bisplev(x, y, contraction_conical_frction_Idelchik_tck));
export let contraction_conical_l_ratios_Blevins = [0.0, 0.05, 0.1, 0.15, 0.6];
export let contraction_conical_A_ratios_Blevins = [1.2, 1.5, 2.0, 3.0, 5.0, 10.0];
export let contraction_conical_Ks_Blevins = [[.08, .06, .04, .03, .03], [.17, .12, .09, .07, .06], [.25, .23, .17, .14, .06], [.33, .31, .27, .23, .08], [.4, .38, .35, .31, .18], [.45, .45, .41, .39, .27]];
// TODO: check named arguments
// let contraction_conical_Blevins_tck = tck_interp2d_linear(contraction_conical_l_ratios_Blevins, contraction_conical_A_ratios_Blevins, contraction_conical_Ks_Blevins, kx=1, ky=1);
export let contraction_conical_Blevins_tck = tck_interp2d_linear(contraction_conical_l_ratios_Blevins, contraction_conical_A_ratios_Blevins, contraction_conical_Ks_Blevins,   1, 1);
export let contraction_conical_Blevins_obj = (x, y) => float(bisplev(x, y, contraction_conical_Blevins_tck));
export let contraction_conical_Miller_tck = implementation_optimize_tck([[-2.2990613088204293, -2.2990613088204293, -2.2990613088204293, -2.2990613088204293, -1.9345621970869704,-1.404550366067981, -1.1205580332553446, -0.7202074014540876, -0.18305354619604816, 0.5791478950190209,1.2576636025381396, 2.2907351590368092, 2.2907351590368092, 2.2907351590368092, 2.2907351590368092],[0.09564194294666524, 0.09564194294666524, 0.17553288711543455, 0.263895293813645, 0.3890819147022019,0.46277323951998217, 0.5504296236707121, 0.7265657737596892, 1.0772357648098938, 1.2566022106161683,1.3896885941879062, 1.3896885941879062],[-0.019518693251672135, 0.04439613867473242, 0.11549650174721836, 0.21325506677861075, 0.268179723158688,0.31125301421509866, 0.38394595875289805, 0.4808287074532006, 0.5205981039085685, 0.5444079315893322,-0.016435668699253902, 0.036132755789022385, 0.09344296094392814, 0.18264727448046977, 0.23460506265914166,0.2772896726095435, 0.3475409775384636, 0.45339837219176454, 0.49766916609817535, 0.533981552804865,-0.006524265764454468, 0.024107195694715193, 0.05862956870028131, 0.12122104285943507, 0.17207312024278762,0.2175356288866053, 0.282297563080016, 0.3995008583081823, 0.4563724107887528, 0.5175856070810377,0.00971345082784277, 0.025981390544674948, 0.0438578322196561, 0.08103403101086341, 0.11351528283253318,0.16873088559958743, 0.2347695003589526, 0.3428907161435351, 0.42017998591926276, 0.49784770602295325,0.022572122504756167, 0.0277671279384801, 0.033512283408629495, 0.05470423531298454, 0.06485563480390757,0.10483763206962131, 0.1802208799223503, 0.29075723837012296, 0.35502824385155335, 0.4460106883062252,0.030312717163327077, 0.03080869253188484, 0.03583128286874324, 0.04627567520803308, 0.050501484562613955,0.05683263025468022, 0.12297253802915259, 0.2415222338797251, 0.3025777968736861, 0.3724407040165538,0.03115993727503623, 0.03443665864698284, 0.03574452046031886, 0.03995718256281492, 0.04759698369059247,0.050404788737262694, 0.052375330859925545, 0.1356057568743366, 0.20463667731329582, 0.26043914743762864,0.02844193432840707, 0.0219797618956514, 0.013352154001094038, 0.018393840217638825, 0.02448602185526976,0.038812331325140816, 0.0522197430071833, 0.057132169238281294, 0.06871138075102912, 0.09334527259294226,0.04089985439478869, 0.07148502476706058, 0.06750266344761692, 0.038560772865945815, 0.020172054809734774,0.01596047961326318, 0.033338955878272625, 0.058808731166289874, 0.055802602927507314, 0.025265841939291166,0.11200365568168691, 0.11945663812857424, 0.10673570013847415, 0.07758458179796549, 0.055266607234870514,0.03072901347153607, 0.025790727504652375, 0.037031664564632104, 0.0601306808668177, 0.07612350738135039,0.0964900248905913, 0.11088549072803407, 0.10778442024110846, 0.09386482850507959, 0.06940476627270852,0.04434507143623664, 0.03331958878624311, 0.01854072032522763, 0.027553821071285824, 0.045426686375783926],3, 1]);
export let contraction_conical_Miller_obj = (l_r2, A_ratio) => Math.max(Math.min(float(bisplev(Math.log(l_r2), Math.log(A_ratio), contraction_conical_Miller_tck)), .5), 0);
export let contraction_conical_methods = ['Rennels', 'Idelchik', 'Crane', 'Swamee', 'Blevins', 'Miller', 'Hooper'];
export let contraction_conical_method_unknown = 'Specified method not recognized; methods are %s' %(contraction_conical_methods);
export function contraction_conical({Di1, Di2, fd=null, l=null, angle=null,
                        Re=null, roughness=0.0, method='Rennels'}) {
    let beta = Di2/Di1;
    if( angle !== null ) {
        let angle_rad = angle*deg2rad;
        let l = (Di1 - Di2)/(2.0*Math.tan(0.5*angle_rad));
    } else if( l !== null ) {
        if( l !== 0.0 ) {
            angle_rad = 2.0*Math.atan((Di1-Di2)/(2.0*l));
        } else {
            angle_rad = Math.PI;
        }
    } else {
        throw new Error( 'ValueError','Either l or angle is required' );
    }
    if( method === 'Rennels' ) {
        if( fd === null ) {
            if( Re === null ) {
                throw new Error( 'ValueError',"The `Rennels` method requires either a specified friction factor or `Re`" );
            }
            let fd = Clamond( {Re: Re, eD: roughness/Di2, fast: false });
        }
        let beta2 = beta*beta;
        let beta4 = beta2*beta2;
        let beta5 = beta4*beta;
        let lbd = 1.0 + 0.622*(angle_rad/Math.PI)**0.8*(1.0 - 0.215*beta2 - 0.785*beta5);
        let sin_half_angle = Math.sin(0.5*angle_rad);
        let K_fr2 = fd*(1.0 - beta4)/(8.0*sin_half_angle);
        let K_conv2 = 0.0696*sin_half_angle*(1.0 - beta5)*lbd*lbd + (lbd - 1.0)**2;
        return K_fr2 + K_conv2;
    } else if( method === 'Crane' ) {
        return contraction_conical_Crane( {Di1: Di1, Di2: Di2, l: l, angle: angle_rad*rad2deg });
    } else if( method === 'Swamee' ) {
        return 0.315*angle_rad**(1.0/3.0);
    } else if( method === 'Idelchik' ) {
        // Diagram 3-6; already digitized for beveled entrance
        let K0 = float(bisplev(angle_rad*rad2deg, l/Di2, entrance_beveled_Idelchik_tck));
        // Angles 0 to 20, ratios 0.05 to 0.06
        if( angle_rad > 20.0*deg2rad ) {
            let angle_fric = 20.0;
        } else if( angle_rad < 2.0*deg2rad ) {
            angle_fric = 2.0;
    } else {
            angle_fric = angle_rad*rad2deg;
        }
        let A_ratio = A_ratio_fric = Di2*Di2/(Di1*Di1);
        if( A_ratio_fric < 0.05 ) {
            let A_ratio_fric = 0.05;
        } else if( A_ratio_fric > 0.6 ) {
            A_ratio_fric = 0.6;
    }
        let K_fr = float(contraction_conical_frction_Idelchik_obj(angle_fric, A_ratio_fric));
        return K0*(1.0 - A_ratio) + K_fr;
    } else if( method === 'Blevins' ) {
        A_ratio = Di1*Di1/(Di2*Di2);
        if( A_ratio < 1.2 ) {
            A_ratio = 1.2;
        } else if( A_ratio > 10.0 ) {
            A_ratio = 10.0;
    }
        let l_ratio = l/Di2;
        if( l_ratio > 0.6 ) {
            l_ratio = 0.6;
        }
        return float(contraction_conical_Blevins_obj(l_ratio, A_ratio));
    } else if( method === 'Miller' ) {
        A_ratio = Di1*Di1/(Di2*Di2);
        if( A_ratio > 4.0 ) {
            A_ratio = 4.0;
        } else if( A_ratio < 1.1 ) {
            A_ratio = 1.1;
    }
        l_ratio = l/(Di2*0.5);
        if( l_ratio < 0.1 ) {
            l_ratio = 0.1;
        } else if( l_ratio > 10.0 ) {
            l_ratio = 10.0;
    }
        // Turning on ofr off the limits - little difference in plot
        return contraction_conical_Miller_obj(l_ratio, A_ratio);
    } else if( method === 'Hooper' ) {
        if( Re === null ) {
            throw new Error( 'ValueError',"Hooper method requires `Re`" );
        }
        let D1_D2 = Di1/Di2;
        let D1_D2_2 = D1_D2*D1_D2;
        if( Re <= 2500.0 ) {
            let K = (1.2 + 160.0/Re)*(D1_D2_2*D1_D2_2 - 1.0);
        } else {
            if( fd === null ) {
                fd = Clamond( {Re: Re, eD: roughness/Di1 });
            }
            K = (0.6 + 0.48*fd)*D1_D2_2*(D1_D2_2 - 1.0);
        }
        if( angle_rad > 0.25*Math.PI ) {
            K *= Math.sqrt(Math.sin(0.5*angle_rad));
        } else {
            K *= 1.6*Math.sin(0.5*angle_rad);
        }
        K = change_K_basis(K, Di1, Di2);
        return K;
    } else {
        throw new Error( 'ValueError',contraction_conical_method_unknown );
    }
}
export function contraction_beveled({Di1, Di2, l=null, angle=null}) {
    angle = radians(angle);
    let beta = Di2/Di1;
    let CB = l/Di2*2.0*beta*Math.tan(0.5*angle)/(1.0 - beta);
    let beta2 = beta*beta;
    let beta5 = beta2*beta2*beta;
    let lbd = 1.0 + 0.622*(1.0 + CB*((angle/Math.PI)**0.8 - 1.0))*(1.0 - 0.215*beta2 - 0.785*beta5);
    return 0.0696*(1.0 + CB*(Math.sin(0.5*angle) - 1.0))*(1.0 - beta5)*lbd*lbd + (lbd-1.0)**2;
}
////// Expansions (diffusers)
export let diffuser_sharp_methods = ['Rennels', 'Hooper'];
export let diffuser_sharp_method_unknown = 'Specified method not recognized; methods are %s' %(diffuser_sharp_methods);
export function diffuser_sharp({Di1, Di2, Re=null, fd=null, roughness=0.0, method='Rennels'}) {
    let beta = Di1/Di2;
    if( method === 'Rennels' ) {
        let r = 1.0 - beta*beta;
        return r*r;
    } else if( method === 'Hooper' ) {
        if( Re === null ) {
            throw new Error( 'ValueError',"Method `Hooper` requires Reynolds number" );
        }
        if( Re < 4000.0 ) {
            return 2.0*(1.0 - beta*beta*beta*beta); // Not the same formula as Rennels
        }
        if( fd === null ) {
            let fd = Clamond( {Re: Re, eD: roughness/Di1 });
        }
        let x = 1.0 - beta*beta;
        return (1.0 + 0.8*fd)*x*x;
    } else {
        throw new Error( 'ValueError',diffuser_sharp_method_unknown );
    }
}
export function diffuser_conical_Crane({Di1, Di2, l=null, angle=null}) {
    let beta = Di1/Di2;
    let beta2 = beta*beta;
    if( angle !== null ) {
        let angle_rad = radians(angle);
        let angle_deg = angle;
    } else if( l !== null ) {
        if( l !== 0.0 ) {
            angle_rad = 2.0*Math.atan((Di1-Di2)/(2.0*l));
            angle_deg = degrees(angle_rad);
        } else {
            angle_rad = Math.PI;
            angle_deg = 180.0;
        }
    } else {
        throw new Error( 'ValueError','Either `l` or `angle` must be specified' );
    }
    if( angle_deg < 45.0 ) {
        // Formula 3
        let K2 = 2.6*Math.sin(0.5*angle_rad)*(1.0 - beta2)**2/(beta2*beta2);
    } else {
        K2 = (1.0 - beta2)**2/(beta2*beta2);
    }
        // formula 4
    let K1 = K2*beta2*beta2; // Standard has become using upstream diameter
    return K1;
}
let tck_diffuser_conical_Miller = implementation_optimize_tck([[-2.307004845727645, -2.307004845727645, -2.307004845727645, -2.307004845727645, -0.852533937110498,-0.08240363489988907, 0.5915927994712962, 0.8982804334259539, 1.2315822114127628, 1.5343291978351532,1.9774792041044793, 2.990267368122924, 2.990267368122924, 2.990267368122924, 2.990267368122924],[0.15265175024859737, 0.15265175024859737, 0.15265175024859737, 0.15265175024859737, 0.40701687154729443,0.6664564516122377, 0.8948974705226967, 1.0144777142876453, 1.0931592421107108, 1.1789561829062467,1.3141101898631344, 1.4016433190574298, 1.4016433190574298, 1.4016433190574298, 1.4016433190574298],[0.06036297171599943, 0.08322477303304361, 0.1533018560180316, 0.23256231139725417, 0.3176212581983357,0.40020914174974515, 0.4385944607898857, 0.5200344894492758, 0.6068491969006803, 0.5644812620968174,0.5206931820307759, 0.05279258341151595, 0.06701886136626269, 0.15460022709300852, 0.22187392289400498,0.3163189969211137, 0.40236602598664045, 0.44217477520553994, 0.5224439320660155, 0.5978399391103398,0.6131809640282799, 0.6101286467987195, 0.05708355184742518, 0.06843627744908527, 0.08943713554460665,0.2666074936578441, 0.3093579837678418, 0.3920305705167829, 0.44503141066730906, 0.5320996705995045,0.5598015078960548, 0.9045290434928654, 1.1278543134986714, 0.004082132921064788, 0.08726673904790738,0.05768023021275458, 0.2018006237954987, 0.31496483541908044, 0.3856708355645899, 0.4432173742517448,0.5150555453757539, 0.5447727935474795, 0.8251456282600432, 0.996071097893787, -0.1110682037244921,0.07314890991840513, 0.06176280023793122, 0.14210338139570033, 0.221133551530109, 0.34303500384378116,0.40130996632027693, 0.49982098188910806, 0.5348917607889022, 0.6163719511180222, 0.6823385842053077,-0.2166378057986125, 0.03883937343819872, 0.06286476564404532, 0.10772310640543344, 0.16931893225970837,0.22920155110345403, 0.32189134044934775, 0.4091523406543155, 0.5122997879847003, 0.5557259511248352,0.5834892444785406, -0.2784258718931251, 0.01614983641474248, 0.06657175843926792, 0.06987287339424499,0.11347683852709868, 0.18271325237542604, 0.24381226992585622, 0.33699751608726225, 0.4328543409526461,0.4932084120786604, 0.5172902462503076, -0.3110304748285624, -0.02554857636053585, 0.04945754727786904,0.06935393005092971, 0.05644398696176074, 0.08533241552366327, 0.15458680076525846, 0.24566876577901098,0.35324686175439035, 0.4095605186012888, 0.4277661722408436, -0.27286175236092153, -0.15488345611240545,-0.09243246273089455, 0.03455782910023685, 0.0829563174865211, 0.05506682466210118, 0.07027248456489407,0.13458355260751956, 0.21084209763905942, 0.2971705194724395, 0.3194829528180993, -0.08063077687005854,-0.4253397307338264, -0.6215191566655465, -0.29467521770312016, 0.018448009119198257, 0.08412326971799582,0.08337420030229001, 0.131275821589702, 0.1623166890922024, 0.21352111168837065, 0.2394011632386149,0.14484414802505116, -0.781141319195365, -1.4412452429263252, -0.6266583715858592, 0.019328251090708078,0.07939124881757918, 0.07570115443982374, 0.10818570632561267, 0.14931529315415798, 0.1845260859797597,0.1975713897205575], 3, 3]);
export let diffuser_conical_Idelchik_angles = [3, 6, 8, 10, 12, 14, 16, 20, 24, 30, 40, 60, 90, 180];
export let diffuser_conical_Idelchik_A_ratios = [0, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6];
export let diffuser_conical_Idelchik_data = [ [0.03, 0.08, 0.11, 0.15, 0.19, 0.23, 0.27, 0.36, 0.47, 0.65, 0.92, 1.15, 1.1, 1.02], [0.03, 0.07, 0.1, 0.14, 0.16, 0.2, 0.24, 0.32, 0.42, 0.58, 0.83, 1.04, 0.99, 0.92], [0.03, 0.07, 0.09, 0.13, 0.16, 0.19, 0.23, 0.3, 0.4, 0.55, 0.79, 0.99, 0.95, 0.88], [0.03, 0.07, 0.09, 0.12, 0.15, 0.18, 0.22, 0.29, 0.38, 0.52, 0.75, 0.93, 0.89, 0.83], [0.02, 0.06, 0.08, 0.11, 0.14, 0.17, 0.2, 0.26, 0.34, 0.46, 0.67, 0.84, 0.79, 0.74], [0.02, 0.05, 0.07, 0.1, 0.12, 0.15, 0.17, 0.23, 0.3, 0.41, 0.59, 0.74, 0.7, 0.65], [0.02, 0.05, 0.06, 0.08, 0.1, 0.13, 0.15, 0.2, 0.26, 0.35, 0.47, 0.65, 0.62, 0.58], [0.02, 0.04, 0.05, 0.07, 0.09, 0.11, 0.13, 0.18, 0.23, 0.31, 0.4, 0.57, 0.54, 0.5], [0.01, 0.03, 0.04, 0.06, 0.07, 0.08, 0.1, 0.13, 0.17, 0.23, 0.33, 0.41, 0.39, 0.37], [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.09, 0.12, 0.16, 0.23, 0.29, 0.28, 0.26], [0.01, 0.01, 0.02, 0.03, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.15, 0.18, 0.17, 0.16]];
export let diffuser_conical_Idelchik_tck = implementation_optimize_tck([[0.0, 0.0, 0.0, 0.0, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.6, 0.6, 0.6, 0.6], [3.0, 3.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 20.0, 24.0, 30.0, 40.0, 60.0, 90.0, 180.0, 180.0], [0.03, 0.08000000000000002, 0.11, 0.15000000000000002, 0.19, 0.23000000000000004, 0.2700000000000001, 0.36000000000000004, 0.4700000000000001, 0.6500000000000001, 0.9200000000000003, 1.1499999999999997, 1.0999999999999999, 1.02, 0.031285899404876215, 0.06962481602354913, 0.12336980866449107, 0.1503712244832664, 0.14378748320215035, 0.20742060216292338, 0.24836000991873095, 0.35209826742177064, 0.43872500319959085, 0.6090878367568959, 0.8690773980930455, 1.0742803401164671, 1.0021612593588036, 0.9451655708069392, 0.028714100595123804, 0.06926407286533984, 0.08440796911328675, 0.1374065532945115, 0.17287918346451642, 0.19813495339263237, 0.23719554563682488, 0.301235065911563, 0.4134972190226316, 0.5698010521319933, 0.8164781574625106, 1.0379418821057562, 1.0011720739745302, 0.9192788736375066, 0.03171453253983491, 0.07116642136473203, 0.09282641155265463, 0.11549496597768823, 0.14338331093620021, 0.17489413621723082, 0.21614667989164066, 0.28946435656236014, 0.37330000426612064, 0.5104504490091938, 0.7371031974573926, 0.9040404534886205, 0.8645483458117367, 0.810220761075916, 0.01599798425801497, 0.0600112625583925, 0.07849171306072822, 0.11003185192295382, 0.14431407179880976, 0.1740127023740962, 0.20378359569975044, 0.2582633102962821, 0.33980922441927436, 0.45585837012862357, 0.6659720355794456, 0.8470955557688615, 0.7909107314263772, 0.7433823030652078, 0.021150220771741206, 0.04655749664043002, 0.0703397965060472, 0.10328500351954951, 0.11954655404108269, 0.1488787675177576, 0.1662463204709797, 0.231242192999296, 0.3007649420874127, 0.4151976547001982, 0.604782427849235, 0.7361883438919813, 0.6970812056056823, 0.6428823350611119, 0.019401132655020165, 0.053758750879887386, 0.06014910091508289, 0.07682813399884816, 0.09749971203685935, 0.13047222755487306, 0.1512311224163308, 0.19676791770653376, 0.2571310072310745, 0.3433510110705831, 0.45489825302361336, 0.6481510686632118, 0.6207644461508929, 0.5850883566903438, 0.02185995392589747, 0.033290416160064826, 0.045368699473134086, 0.06692723598046114, 0.08810622640302032, 0.10215235383204274, 0.1213618790128196, 0.17665887566391483, 0.2219043695740277, 0.3007473976664318, 0.37586666240054567, 0.5455594857191605, 0.5128931976706977, 0.4673228653399028, 1.2670378191600348e-05, 0.03091333375994541, 0.03916320044367654, 0.06214899426206778, 0.062121072502719726, 0.06871380729933241, 0.09367771591902911, 0.10605919242336995, 0.14532614492011708, 0.196826752842303, 0.32944561762761065, 0.340669205008426, 0.32703730722467556, 0.32918425374885374, 0.014993664810904203, 0.014543333120027308, 0.025418399778161738, 0.026425502868966118, 0.04393946374864015, 0.0556430963503338, 0.05566114204048549, 0.07947040378831506, 0.10483692753994148, 0.13908662357884857, 0.1752771911861948, 0.26216539749578693, 0.2564813463876624, 0.22290787312557322, 0.01, 0.01, 0.02, 0.03, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.15, 0.18, 0.17, 0.16], 3, 1]);
export let diffuser_conical_Idelchik_obj = (x, y ) => float(bisplev(x, y, diffuser_conical_Idelchik_tck));
export let diffuser_conical_methods = ['Rennels', 'Crane', 'Miller', 'Swamee', 'Idelchik', 'Hooper'];
export let diffuser_conical_method_unknown = 'Specified method not recognized; methods are %s' %(diffuser_conical_methods);
export function diffuser_conical({Di1, Di2, l=null, angle=null, fd=null, Re=null,
                     roughness=0.0, method='Rennels'}) {
    let beta = Di1/Di2;
    let beta2 = beta*beta;
    if( l !== null ) {
        let angle_rad = 2.0*Math.atan(0.5*(Di2-Di1)/l);
        let angle_deg = angle_rad*rad2deg;
        let l_calc = l;
    } else if( angle !== null ) {
        angle_rad = angle*deg2rad;
        angle_deg = angle;
        l_calc = (Di2 - Di1)/(2.0*Math.tan(0.5*angle_rad));
} else {
        throw new Error( 'ValueError','Either `l` or `angle` must be specified' );
    }
    if( method === null ) {
        let method = 'Rennels';
    }
    if( method === 'Rennels' ) {
        if( fd === null ) {
            if( Re === null ) {
                throw new Error( 'ValueError',"The `Rennels` method requires either a specified friction factor or `Re`" );
            }
            let fd = Clamond( {Re: Re, eD: roughness/Di2, fast: false });
        }
        if( 0.0 < angle_deg <= 20.0 ) {
            let K = 8.30*Math.tan(0.5*angle_rad)**1.75*(1.0 - beta2)**2 + 0.125*fd*(1.0 - beta2*beta2)/Math.sin(0.5*angle_rad);
        } else if( 20.0 < angle_deg <= 60.0 && 0.0 <= beta < 0.5 ) {
            K = (1.366*Math.sqrt(Math.sin(2.0*Math.PI*(angle_deg - 15.0)/180.)) - 0.170
            - 3.28*(0.0625-beta**4)*Math.sqrt(0.025*(angle_deg-20.0)))*(1.0 - beta2)**2 + 0.125*fd*(1.0 - beta2*beta2)/Math.sin(0.5*angle_rad);
        } else if( 20.0 < angle_deg <= 60.0 && beta >= 0.5 ) {
            K = (1.366*Math.sqrt(Math.sin(2.0*Math.PI*(angle_deg - 15.0)/180.0)) - 0.170)*(1.0 - beta2)**2 + 0.125*fd*(1.0 - beta2*beta2)/Math.sin(0.5*angle_rad);
        } else if( 60.0 < angle_deg <= 180.0 && 0.0 <= beta < 0.5 ) {
            let beta4 = beta2*beta2;
            K = (1.205 - 3.28*(0.0625 - beta4) - 12.8*beta4*beta2*Math.sqrt((angle_deg - 60.0)/120.))*(1.0 - beta2)**2;
        } else if( 60.0 < angle_deg <= 180.0 && beta >= 0.5 ) {
            K = (1.205 - 0.20*Math.sqrt((angle_deg - 60.0)/120.))*(1.0 - beta**2)**2;
        } else {
            throw new Error( 'ValueError','Conical diffuser inputs incorrect' );
        }
        return K;
    } else if( method === 'Crane' ) {
        return diffuser_conical_Crane( {Di1: Di1, Di2: Di2, l: l_calc, angle: angle_deg });
    } else if( method === 'Miller' ) {
        let A_ratio = 1.0/beta2;
        if( A_ratio > 4.0 ) {
            A_ratio = 4.0;
        } else if( A_ratio < 1.1 ) {
            A_ratio = 1.1;
    }
        let l_R1_ratio = l_calc/(0.5*Di1);
        if( l_R1_ratio < 0.1 ) {
            l_R1_ratio = 0.1;
        } else if( l_R1_ratio > 20.0 ) {
            l_R1_ratio = 20.0;
    }
        let Kd = Math.max(float(bisplev(Math.log(l_R1_ratio), Math.log(A_ratio), tck_diffuser_conical_Miller)), 0);
        return Kd;
    } else if( method === 'Idelchik' ) {
        A_ratio = beta2;
        // Angles 0 to 20, ratios 0.05 to 0.06
        if( angle_deg > 20.0 ) {
            let angle_fric = 20.0;
        } else if( angle_deg < 2.0 ) {
            angle_fric = 2.0;
    } else {
            angle_fric = angle_deg;
        }
        let A_ratio_fric = A_ratio;
        if( A_ratio_fric < 0.05 ) {
            A_ratio_fric = 0.05;
        } else if( A_ratio_fric > 0.6 ) {
            A_ratio_fric = 0.6;
    }
        let K_fr = float(contraction_conical_frction_Idelchik_obj(angle_fric, A_ratio_fric));
        let K_exp = float(diffuser_conical_Idelchik_obj(min(0.6, A_ratio), Math.max(3.0, angle_deg)));
        return K_fr + K_exp;
    } else if( method === 'Swamee' ) {
        // Really starting to thing Swamee uses a different definition of loss coefficient!
        let r = Di2/Di1;
        K = 1.0/Math.sqrt(0.25*angle_rad**-3*(1.0 + 0.6*r**(-1.67)*(Math.PI-angle_rad)/angle_rad)**(0.533*r - 2.6));
        return K;
    } else if( method === 'Hooper' ) {
        if( Re === null ) {
            throw new Error( 'ValueError',"Method `Hooper` requires Reynolds number" );
        }
        if( Re < 4000.0 ) {
            return 2.0*(1.0 - beta*beta*beta*beta); // Not the same formula as Rennels
        }
        if( fd === null ) {
            fd = Clamond( {Re: Re, eD: roughness/Di1 });
        }
        let x = 1.0 - beta*beta;
        K = (1.0 + 0.8*fd)*x*x;
        if( angle_rad > 0.25*Math.PI ) {
            return K;
        }
        return K*2.6*Math.sin(0.5*angle_rad);
    } else {
        throw new Error( 'ValueError',diffuser_conical_method_unknown );
    }
}
export function diffuser_conical_staged({Di1, Di2, DEs, ls, fd=null, method='Rennels'}) {
    let K = 0.0;
    K += diffuser_conical( {Di1: Di1, Di2: DEs[0], l: ls[0], fd: fd, method: method });
    K += diffuser_conical( {Di1: DEs[-1], Di2: Di2, l: ls[-1], fd: fd, method: method });
    for( let i of range(len(DEs)-1) ) {
        K += diffuser_conical( {Di1: DEs[i], Di2: DEs[i+1], l: ls[i+1], fd: fd, method: method });
    }
    return K;
}
export function diffuser_curved({Di1, Di2, l}) {
    let beta = Di1/Di2;
    let phi = 1.01 - 0.624*l/Di1 + 0.30*(l/Di1)**2 - 0.074*(l/Di1)**3 + 0.0070*(l/Di1)**4;
    return phi*(1.43 - 1.3*beta**2)*(1 - beta**2)**2;
}
export function diffuser_pipe_reducer({Di1, Di2, l, fd1, fd2=null}) {
    if( fd2 === null ) {
        let fd2 = fd1;
    }
    let beta = Di1/Di2;
    let angle = -2*Math.atan((Di1-Di2)/1.20/l);
    let K = fd1*0.20*l/Di1 + fd1*(1-beta)/8./Math.sin(angle/2) + fd2*0.20*l/Di2*beta**4;
    return K;
}
////// TODO: Tees
//////  3 Darby 3K Method (with valves)
/*Dictionary of coefficients for Darby's 3K fitting pressure drop method;
the tuple contains :math:`K_1` and :math:`K_i` and :math:`K_d` in that order.
*/
export let Darby = {
  'Elbow, 90°, threaded, standard, (r/D = 1)': [800.0, 0.14, 4.0],
  'Elbow, 90°, threaded, long radius, (r/D = 1.5)': [800.0, 0.071, 4.2],
  'Elbow, 90°, flanged, welded, bends, (r/D = 1)': [800.0, 0.091, 4.0],
  'Elbow, 90°, (r/D = 2)': [800.0, 0.056, 3.9],
  'Elbow, 90°, (r/D = 4)': [800.0, 0.066, 3.9],
  'Elbow, 90°, (r/D = 6)': [800.0, 0.075, 4.2],
  'Elbow, 90°, mitered, 1 weld, (90°)': [1000.00, 0.27, 4.0],
  'Elbow, 90°, 2 welds, (45°)': [800.0, 0.068, 4.1],
  'Elbow, 90°, 3 welds, (30°)': [800.0, 0.035, 4.2],
  'Elbow, 45°, threaded standard, (r/D = 1)': [500.0, 0.071, 4.2],
  'Elbow, 45°, long radius, (r/D = 1.5)': [500.0, 0.052, 4.0],
  'Elbow, 45°, mitered, 1 weld, (45°)': [500.0, 0.086, 4.0],
  'Elbow, 45°, mitered, 2 welds, (22.5°)': [500.0, 0.052, 4.0],
  'Elbow, 180°, threaded, close-return bend, (r/D = 1)': [1000.00, 0.23, 4.0],
  'Elbow, 180°, flanged, (r/D = 1)': [1000.00, 0.12, 4.0],
  'Elbow, 180°, all, (r/D = 1.5)': [1000.00, 0.1, 4.0],
  'Tee, Through-branch, (as elbow), threaded, (r/D = 1)': [500.0, 0.274, 4.0],
  'Tee, Through-branch,(as elbow), (r/D = 1.5)': [800.0, 0.14, 4.0],
  'Tee, Through-branch, (as elbow), flanged, (r/D = 1)': [800.0, 0.28, 4.0],
  'Tee, Through-branch, (as elbow), stub-in branch': [1000.00, 0.34, 4.0],
  'Tee, Run-through, threaded, (r/D = 1)': [200.0, 0.091, 4.0],
  'Tee, Run-through, flanged, (r/D = 1)': [150.0, 0.05, 4.0],
  'Tee, Run-through, stub-in branch': [100.0, 0.0, 0.0],
  'Valve, Angle valve, 45°, full line size, β = 1': [950.0, 0.25, 4.0],
  'Valve, Angle valve, 90°, full line size, β = 1': [1000.0, 0.69, 4.0],
  'Valve, Globe valve, standard, β = 1': [1500.0, 1.7, 3.6],
  'Valve, Plug valve, branch flow': [500.0, 0.41, 4.0],
  'Valve, Plug valve, straight through': [300.0, 0.084, 3.9],
  'Valve, Plug valve, three-way (flow through)': [300.0, 0.14, 4.0],
  'Valve, Gate valve, standard, β = 1': [300.0, 0.037, 3.9],
  'Valve, Ball valve, standard, β = 1': [300.0, 0.017, 3.5],
  'Valve, Diaphragm, dam type': [1000.00, 0.69, 4.9],
  'Valve, Swing check': [1500.0, 0.46, 4.0],
  'Valve, Lift check': [2000.00, 2.85, 3.8]
}
try {
    if (IS_NUMBA) // type: ignore
        {
          Darby_keys = tuple(Darby.keys());
          Darby_values = tuple(Darby.values());
        }
      }
catch(e){
    /* pass */
  }
export function Darby3K({NPS=null, Re=null, name=null, K1=null, Ki=null, Kd=null}) {
    if( name !== null ) {
        let K1 = null;
        if( name in Darby ) { // NUMBA: DELETE
            [K1, Ki, Kd] = Darby[name]; // NUMBA: DELETE
        }
        if( K1 === null ) {
            try {
                [K1, Ki, Kd] = Darby_values[Darby_keys.index(name)];
            } catch( e ) {
                throw new Error( 'ValueError','Name of fitting is not in database' );
            }
        }
    } else if( K1 !== null && Ki !== null && Kd !== null ) {
        /* pass */
} else {
        throw new Error( 'ValueError','Name of fitting or constants are required' );
    }
    return K1/Re + Ki*(1. + Kd*NPS**-0.3);
}
////// 2K Hooper Method
export let Hooper = {
  'Elbow, 90°, Standard [R/D: 1], Screwed': [800.0, 0.4],
  'Elbow, 90°, Standard [R/D: 1], Flanged/welded': [800.0, 0.25],
  'Elbow, 90°, Long-radius [R/D: 1.5], All types': [800.0, 0.2],
  'Elbow, 90°, Mitered [R/D: 1.5], 1 weld [90° angle]': [1000.0, 1.15],
  'Elbow, 90°, Mitered [R/D: 1.5], 2 weld [45° angle]': [800.0, 0.35],
  'Elbow, 90°, Mitered [R/D: 1.5], 3 weld [30° angle]': [800.0, 0.3],
  'Elbow, 90°, Mitered [R/D: 1.5], 4 weld [22.5° angle]': [800.0, 0.27],
  'Elbow, 90°, Mitered [R/D: 1.5], 5 weld [18° angle]': [800.0, 0.25],
  'Elbow, 45°, Standard [R/D: 1], All types': [500.0, 0.2],
  'Elbow, 45°, Long-radius [R/D 1.5], All types': [500.0, 0.15],
  'Elbow, 45°, Mitered [R/D=1.5], 1 weld [45° angle]': [500.0, 0.25],
  'Elbow, 45°, Mitered [R/D=1.5], 2 weld [22.5° angle]': [500.0, 0.15],
  'Elbow, 45°, Standard [R/D: 1], Screwed': [1000.0, 0.7],
  'Elbow, 180°, Standard [R/D: 1], Flanged/welded': [1000.0, 0.35],
  'Elbow, 180°, Long-radius [R/D: 1.5], All types': [1000.0, 0.3],
  'Elbow, Used as, Standard, Screwed': [500.0, 0.7],
  'Elbow, Elbow, Long-radius, Screwed': [800.0, 0.4],
  'Elbow, Elbow, Standard, Flanged/welded': [800.0, 0.8],
  'Elbow, Elbow, Stub-in type branch': [1000.0, 1.0],
  'Tee, Run, Screwed': [200.0, 0.1],
  'Tee, Through, Flanged or welded': [150.0, 0.05],
  'Tee, Tee, Stub-in type branch': [100.0, 0.0],
  'Valve, Gate, Full line size, Beta: 1': [300.0, 0.1],
  'Valve, Ball, Reduced trim, Beta: 0.9': [500.0, 0.15],
  'Valve, Plug, Reduced trim, Beta: 0.8': [1000.0, 0.25],
  'Valve, Globe, Standard': [1500.0, 4.0],
  'Valve, Globe, Angle or Y-type': [1000.0, 2.0],
  'Valve, Diaphragm, Dam type': [1000.0, 2.0],
  'Valve, Butterfly,': [800.0, 0.25],
  'Valve, Check, Lift': [2000.0, 10.0],
  'Valve, Check, Swing': [1500.0, 1.5],
  'Valve, Check, Tilting-disc': [1000.0, 0.5]
};

try {
    if (IS_NUMBA) // type: ignore
        {
            Hooper_keys = tuple(Hooper.keys());
            Hooper_values = tuple(Hooper.values());
        }
}
catch(e){
    /* pass */
}
export function Hooper2K({Di, Re, name=null, K1=null, Kinfty=null}) {
    if( name !== null ) {
        let K1 = null;
        if( name in Hooper ) { // NUMBA: DELETE
            [K1, Kinfty] = Hooper[name]; // NUMBA: DELETE
        }
        if( K1 === null ) {
            try {
                [K1, Kinfty] = Hooper_values[Hooper_keys.index(name)];
            } catch( e ) {
                throw new Error( 'ValueError','Name of fitting is not in database' );
            }
        }
    } else if( K1 !== null && Kinfty !== null ) {
        /* pass */
} else {
        throw new Error( 'ValueError','Name of fitting or constants are required' );
    }
    return K1/Re + Kinfty*(1. + 1./Di);
}
////// Valves
export function Kv_to_Cv(Kv) {
    return 1.1560992283536566*Kv;
}
export function Cv_to_Kv(Cv) {
    return Cv/1.1560992283536566;
}
export function Kv_to_K({Kv, D}) {
    return 1.6E9*D**4*Kv**-2;
}
export function K_to_Kv({K, D}) {
    return D*D*Math.sqrt(1.6E9/K);
}
export function K_to_Cv({K, D}) {
    return 1.1560992283536566*D*D*Math.sqrt(1.6E9/K);
}
export function Cv_to_K({Cv, D}) {
    let D2 = D*D;
    let term = (Cv*(1.0/1.1560992283536566));
    return 1.6E9*D2*D2/(term*term);
}
export function K_gate_valve_Crane({D1, D2, angle, fd=null}) {
    angle = radians(angle);
    let beta = D1/D2;
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    let K1 = 8.0*fd; // This does not refer to upstream loss per se
    if( beta === 1.0 || angle === 0.0 ) {
        return K1; // upstream and down
    } else {
        let beta2 = beta*beta;
        let one_m_beta2 = 1.0 - beta2;
        if( angle <= 0.7853981633974483 ) {
            let K = (K1 + Math.sin(0.5*angle)*(one_m_beta2*(0.8 + 2.6*one_m_beta2)))/(beta2*beta2);
        } else {
            K = (K1 + one_m_beta2*(0.5*Math.sqrt(Math.sin(0.5*angle)) + one_m_beta2))/(beta2*beta2);
        }
    }
    return K;
}
export function K_globe_valve_Crane({D1, D2, fd=null}) {
    let beta = D1/D2;
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    let K1 = 340.0*fd;
    if( beta === 1.0 ) {
        return K1; // upstream and down
    } else {
        let beta2 = beta*beta;
        let one_m_beta = 1.0 - beta;
        let one_m_beta2 = 1.0 - beta2;
        return (K1 + beta*(0.5*one_m_beta*one_m_beta
                           + one_m_beta2*one_m_beta2))/(beta2*beta2);
    }
}
export function K_angle_valve_Crane({D1, D2, fd=null, style=0}) {
    let beta = D1/D2;
    if( [0, 1, 2].indexOf(style) == -1 ) {
        throw new Error( 'ValueError','Valve style should be 0, 1, or 2' );
    }
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    if( style === 0 || style === 2 ) {
        let K1 = 55.0*fd;
    } else {
        K1 = 150.0*fd;
    }
    if( beta === 1 ) {
        return K1; // upstream and down
    } else {
        return (K1 + beta*(0.5*(1-beta)**2 + (1-beta**2)**2))/beta**4;
    }
}
export function K_swing_check_valve_Crane({D=null, fd=null, angled=true}) {
    if( D === null && fd === null ) {
        throw new Error( 'ValueError','Either `D` or `fd` must be specified' );
    }
    if( fd === null ) {
        let fd = ft_Crane(D);
    }
    if( angled ) {
        return 100.*fd;
    }
    return 50.*fd;
}
export function K_lift_check_valve_Crane({D1, D2, fd=null, angled=true}) {
    let beta = D1/D2;
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    if( angled ) {
        let K1 = 55*fd;
        if( beta === 1 ) {
            return K1;
        } else {
            return (K1 + beta*(0.5*(1 - beta**2) + (1 - beta**2)**2))/beta**4;
        }
    } else {
        K1 = 600.*fd;
        if( beta === 1 ) {
            return K1;
        } else {
            return (K1 + beta*(0.5*(1 - beta**2) + (1 - beta**2)**2))/beta**4;
        }
    }
}
export function K_tilting_disk_check_valve_Crane({D, angle, fd=null}) {
    if( fd === null ) {
        let fd = ft_Crane(D);
    }
    if( angle < 10 ) {
        // 5 degree case
        if( D <= 0.2286 ) {
            // 2-8 inches, split at 9 inch
            return 40*fd;
        } else if( D <= 0.381 ) {
            // 10-14 inches, split at 15 inch
            return 30*fd;
} else {
            // 16-18 inches
            return 20*fd;
        }
    } else {
        // 15 degree case
        if( D < 0.2286 ) {
            // 2-8 inches
            return 120*fd;
        } else if( D < 0.381 ) {
            // 10-14 inches
            return 90*fd;
} else {
            // 16-18 inches
            return 60*fd;
        }
    }
}
let globe_stop_check_valve_Crane_coeffs = {0: 400.0, 1: 300.0, 2: 55.0};
export function K_globe_stop_check_valve_Crane({D1, D2, fd=null, style=0}) {
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    if( style === 0 ) {
        let K = 400.0*fd;
    } else if( style === 1 ) {
        K = 300.0*fd;
} else if( style === 2 ) {
        K = 55.0*fd;
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0, 1, and 2 only' );
    }
    let beta = D1/D2;
    if( beta === 1.0 ) {
        return K;
    } else {
        return (K + beta*(0.5*(1 - beta**2) + (1 - beta**2)**2))/beta**4;
    }
}
let angle_stop_check_valve_Crane_coeffs = {0: 200.0, 1: 350.0, 2: 55.0};
export function K_angle_stop_check_valve_Crane({D1, D2, fd=null, style=0}) {
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    if( style === 0 ) {
        let K = 200.0*fd;
    } else if( style === 1 ) {
        K = 350.0*fd;
} else if( style === 2 ) {
        K = 55.0*fd;
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0, 1, and 2 only' );
    }
    let beta = D1/D2;
    if( beta === 1 ) {
        return K;
    } else {
        return (K + beta*(0.5*(1.0 - beta**2) + (1.0 - beta**2)**2))/beta**4;
    }
}
export function K_ball_valve_Crane({D1, D2, angle, fd=null}) {
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    let beta = D1/D2;
    let K1 = 3*fd;
    angle = radians(angle);
    if( beta === 1 ) {
        return K1;
    } else {
        if( angle <= Math.PI/4 ) {
            return (K1 + Math.sin(angle/2)*(0.8*(1-beta**2) + 2.6*(1-beta**2)**2))/beta**4;
        } else {
            return (K1 + 0.5*Math.sqrt(Math.sin(angle/2)) * (1 - beta**2) + (1-beta**2)**2)/beta**4;
        }
    }
}
let diaphragm_valve_Crane_coeffs = {0: 149.0, 1: 39.0};
export function K_diaphragm_valve_Crane({D=null, fd=null, style=0}) {
    if( D === null && fd === null ) {
        throw new Error( 'ValueError','Either `D` or `fd` must be specified' );
    }
    if( fd === null ) {
        let fd = ft_Crane(D);
    }
    if( style === 0 ) {
        let K = 149.0*fd;
    } else if( style === 1 ) {
        K = 39.0*fd;
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0 (weir) or 1 (straight through) only' );
    }
    return K;
}
let foot_valve_Crane_coeffs = {0: 420.0, 1: 75.0};
export function K_foot_valve_Crane({D=null, fd=null, style=0}) {
    if( D === null && fd === null ) {
        throw new Error( 'ValueError','Either `D` or `fd` must be specified' );
    }
    if( fd === null ) {
        let fd = ft_Crane(D);
    }
    if( style === 0 ) {
        let K = 420.0*fd;
    } else if( style === 1 ) {
        K = 75.0*fd;
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0 (poppet disk) or 1 (hinged disk) only' );
    }
    return K;
}
let butterfly_valve_Crane_coeffs = {0: (45.0, 35.0, 25.0), 1: (74.0, 52.0, 43.0),
                                2: (218.0, 96.0, 55.0)};
export function K_butterfly_valve_Crane({D, fd=null, style=0}) {
    if( fd === null ) {
        let fd = ft_Crane(D);
    }
    if( style === 0 ) {
        let [c1, c2, c3] = [45.0, 35.0, 25.0];
    } else if( style === 1 ) {
        let [c1, c2, c3] = [74.0, 52.0, 43.0];
} else if( style === 2 ) {
        let [c1, c2, c3] = [218.0, 96.0, 55.0];
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0 (centric), 1 (double offset), or 2 (triple offset) only.' );
    }
    if( D <= 0.2286 ) {
        // 2-8 inches, split at 9 inch
        return c1*fd;
    } else if( D <= 0.381 ) {
        // 10-14 inches, split at 15 inch
        return c2*fd;
} else {
        // 16-18 inches
        return c3*fd;
    }
}
let plug_valve_Crane_coeffs = {0: 18.0, 1: 30.0, 2: 90.0};
export function K_plug_valve_Crane({D1, D2, angle, fd=null, style=0}) {
    if( fd === null ) {
        let fd = ft_Crane(D2);
    }
    let beta = D1/D2;
    if( style === 0 ) {
        let K = 18.0*fd;
    } else if( style === 1 ) {
        K = 30.0*fd;
} else if( style === 2 ) {
        K = 90.0*fd;
} else {
        throw new Error( 'ValueError','Accepted valve styles are 0 (straight-through), 1 (3-way, flow straight-through), or 2 (3-way, flow 90°)' );
    }
    angle = radians(angle);
    if( beta === 1 ) {
        return K;
    } else {
        return (K + 0.5*Math.sqrt(Math.sin(angle/2)) * (1 - beta**2) + (1-beta**2)**2)/beta**4;
    }
}
export function v_lift_valve_Crane({rho, D1=null, D2=null, style='swing check angled'}) {
    let specific_volume = 1./rho;
    if( D1 !== null && D2 !== null ) {
        let beta = D1/D2;
        let beta2 = beta*beta;
    }
    if( style === 'swing check angled' ) {
        return 45.0*Math.sqrt(specific_volume);
    } else if( style === 'swing check straight' ) {
        return 75.0*Math.sqrt(specific_volume);
}
 else if( style === 'swing check UL' ) {
        return 120.0*Math.sqrt(specific_volume);
}
 else if( style === 'lift check straight' ) {
        return 50.0*beta2*Math.sqrt(specific_volume);
}
 else if( style === 'lift check angled' ) {
        return 170.0*beta2*Math.sqrt(specific_volume);
}
 else if( style === 'tilting check 5°' ) {
        return 100.0*Math.sqrt(specific_volume);
}
 else if( style === 'tilting check 15°' ) {
        return 40.0*Math.sqrt(specific_volume);
}
 else if( style === 'stop check globe 1' ) {
        return 70.0*beta2*Math.sqrt(specific_volume);
}
 else if( style === 'stop check angle 1' ) {
        return 95.0*beta2*Math.sqrt(specific_volume);
}
 else if( style in ['stop check globe 2', 'stop check angle 2'] ) {
        return 75.0*beta2*Math.sqrt(specific_volume);
}
 else if( style in ['stop check globe 3', 'stop check angle 3'] ) {
        return 170.0*beta2*Math.sqrt(specific_volume);
}
 else if( style === 'foot valve poppet disc' ) {
        return 20.0*Math.sqrt(specific_volume);
}
 else if( style === 'foot valve hinged disc' ) {
        return 45.0*Math.sqrt(specific_volume);
}
}
let branch_converging_Crane_Fs = [1.74, 1.41, 1.0, 0.0];
let branch_converging_Crane_angles = [30.0, 45.0, 60.0, 90.0];
export function K_branch_converging_Crane({D_run, D_branch, Q_run, Q_branch, angle=90.0}) {
    let beta = (D_branch/D_run);
    let beta2 = beta*beta;
    let Q_comb = Q_run + Q_branch;
    let Q_ratio = Q_branch/Q_comb;
    if( beta2 <= 0.35 ) {
        let C = 1.;
    } else if( Q_ratio <= 0.4 ) {
        C = 0.9*(1 - Q_ratio);
} else {
        C = 0.55;
    }
    let [D, E] = [1., 2.];
    let F = interp(angle, branch_converging_Crane_angles, branch_converging_Crane_Fs);
    let K = C*(1. + D*((Q_ratio/beta2)**2) - E*((1. - Q_ratio)**2) - F/beta2*(Q_ratio**2));
    return K;
}
let run_converging_Crane_Fs = [1.74, 1.41, 1.0];
let run_converging_Crane_angles = [30.0, 45.0, 60.0];
export function K_run_converging_Crane({D_run, D_branch, Q_run, Q_branch, angle=90}) {
    let beta = (D_branch/D_run);
    let beta2 = beta*beta;
    let Q_comb = Q_run + Q_branch;
    let Q_ratio = Q_branch/Q_comb;
    if( angle < 75.0 ) {
        let C = 1.0;
    } else {
        return 1.55*(Q_ratio) - Q_ratio*Q_ratio;
    }
    let [D, E] = [0.0, 1.0];
    let F = interp(angle, run_converging_Crane_angles, run_converging_Crane_Fs);
    let K = C*(1. + D*((Q_ratio/beta2)**2) - E*((1. - Q_ratio)**2) - F/beta2*(Q_ratio**2));
    return K;
}
export function K_branch_diverging_Crane({D_run, D_branch, Q_run, Q_branch, angle=90}) {
    let beta = (D_branch/D_run);
    let beta2 = beta*beta;
    let Q_comb = Q_run + Q_branch;
    let Q_ratio = Q_branch/Q_comb;
    if( angle < 60 || beta <= 2/3. ) {
        let [H, J] = [1., 2.];
    } else {
        let [H, J] = [0.3, 0];
    }
    if( angle < 75 ) {
        if( beta2 <= 0.35 ) {
            if( Q_ratio <= 0.4 ) {
                let G = 1.1 - 0.7*Q_ratio;
            } else {
                G = 0.85;
            }
        } else {
            if( Q_ratio <= 0.6 ) {
                G = 1.0 - 0.6*Q_ratio;
            } else {
                G = 0.6;
            }
        }
    } else {
        if( beta2 <= 2/3. ) {
            G = 1;
        } else {
            G = 1 + 0.3*Q_ratio*Q_ratio;
        }
    }
    let angle_rad = radians(angle);
    let K_branch = G*(1 + H*(Q_ratio/beta2)**2 - J*(Q_ratio/beta2)*Math.cos(angle_rad));
    return K_branch;
}
export function K_run_diverging_Crane({D_run, D_branch, Q_run, Q_branch, angle=90}) {
    let beta = (D_branch/D_run);
    let beta2 = beta*beta;
    let Q_comb = Q_run + Q_branch;
    let Q_ratio = Q_branch/Q_comb;
    if( beta2 <= 0.4 ) {
        let M = 0.4;
    } else if( Q_ratio <= 0.5 ) {
        M = 2.*(2.*Q_ratio - 1.);
} else {
        M = 0.3*(2.*Q_ratio - 1.);
    }
    return M*Q_ratio*Q_ratio;
}
