import { hp } from './fluids.constants.js' ;
import { interp, tck_interp2d_linear, bisplev, round } from './fluids.numerics_init.js' ;
let __all__ = ['VFD_efficiency', 'CSA_motor_efficiency', 'motor_efficiency_underloaded', 'Corripio_pump_efficiency', 'Corripio_motor_efficiency', 'specific_speed', 'specific_diameter', 'speed_synchronous', 'nema_sizes', 'nema_sizes_hp', 'motor_round_size', 'nema_min_P', 'nema_high_P', 'electrical_plug_types', 'voltages_1_phase_residential', 'voltages_3_phase', 'residential_power_frequencies', 'residential_power', 'industrial_power', 'current_ideal', 'CountryPower'];
export function Corripio_pump_efficiency(Q) {
    Q *= 15850.323;
    let logQ = Math.log(Q);
    return -0.316 + 0.24015*logQ - 0.01199*logQ*logQ;
}
export function Corripio_motor_efficiency(P) {
    P = P/745.69987;
    let logP = Math.log(P);
    return 0.8 + 0.0319*logP - 0.00182*logP*logP;
}
let VFD_efficiencies = [[0.31, 0.77, 0.86, 0.9, 0.91, 0.93, 0.94], [0.35, 0.8, 0.88, 0.91, 0.92, 0.94, 0.95], [0.41, 0.83, 0.9, 0.93, 0.94, 0.95, 0.96], [0.47, 0.86, 0.93, 0.94, 0.95, 0.96, 0.97], [0.5, 0.88, 0.93, 0.95, 0.95, 0.96, 0.97], [0.46, 0.86, 0.92, 0.95, 0.95, 0.96, 0.97], [0.51, 0.87, 0.92, 0.95, 0.95, 0.96, 0.97], [0.47, 0.86, 0.93, 0.95, 0.96, 0.97, 0.97], [0.55, 0.89, 0.94, 0.95, 0.96, 0.97, 0.97], [0.61, 0.91, 0.95, 0.96, 0.96, 0.97, 0.97], [0.61, 0.91, 0.95, 0.96, 0.96, 0.97, 0.97]];
export let VFD_efficiency_loads = [0.016, 0.125, 0.25, 0.42, 0.5, 0.75, 1.0];
export let VFD_efficiency_powers = [3.0, 5.0, 10.0, 20.0, 30.0, 50.0, 60.0, 75.0, 100.0, 200.0, 400.0];
export let VFD_efficiency_tck = tck_interp2d_linear(VFD_efficiency_loads, VFD_efficiency_powers, VFD_efficiencies);
export function VFD_efficiency({P, load=1}) {
    P = P/hp; // convert to hp
    if( P < 3.0 ) {
        P = 3.0;
    } else if( P > 400.0 ) {
        P = 400.0;
    }
    if( load < 0.016 ) {
        load = 0.016;
    }
    return round(bisplev(load, P, VFD_efficiency_tck), 4);
}
export let nema_sizes_hp = [0.25, 0.3333333333333333, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 5.5, 7.5, 10.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 75.0, 100.0, 125.0, 150.0, 175.0, 200.0, 250.0, 300.0, 350.0, 400.0, 450.0, 500.0];
/*list: all NEMA motor sizes in increasing order, in horsepower.
*/
export let nema_sizes = nema_sizes_hp.map((i) => i*hp);
/*list: all NEMA motor sizes in increasing order, in Watts.
*/
export function motor_round_size(P) {
    for( let P_actual of nema_sizes ) { if( P_actual >= P ) { return P_actual; } }
    throw new Error( 'ValueError','Required power is larger than can be provided with one motor' );
}
export let nema_high_P = [1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 5.5, 7.5, 10.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 75.0, 100.0, 125.0, 150.0, 175.0, 200.0];
let nema_high_full_open_2p = [0.77, 0.84, 0.855, 0.855, 0.865, 0.865, 0.865, 0.885, 0.895, 0.902, 0.91, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.936, 0.941, 0.941, 0.95, 0.95];
let nema_high_full_open_4p = [0.855, 0.865, 0.865, 0.895, 0.895, 0.895, 0.895, 0.91, 0.917, 0.93, 0.93, 0.936, 0.941, 0.941, 0.945, 0.95, 0.95, 0.954, 0.954, 0.958, 0.958, 0.958];
let nema_high_full_open_6p = [0.825, 0.865, 0.875, 0.885, 0.895, 0.895, 0.895, 0.902, 0.917, 0.917, 0.924, 0.93, 0.936, 0.941, 0.941, 0.945, 0.945, 0.95, 0.95, 0.954, 0.954, 0.954];
let nema_high_full_closed_2p = [0.77, 0.84, 0.855, 0.865, 0.885, 0.885, 0.885, 0.895, 0.902, 0.91, 0.91, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.941, 0.95, 0.95, 0.954, 0.954];
let nema_high_full_closed_4p = [0.855, 0.865, 0.865, 0.895, 0.895, 0.895, 0.895, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.941, 0.945, 0.95, 0.954, 0.954, 0.954, 0.958, 0.962, 0.962];
let nema_high_full_closed_6p = [0.825, 0.875, 0.885, 0.895, 0.895, 0.895, 0.895, 0.91, 0.91, 0.917, 0.917, 0.93, 0.93, 0.941, 0.941, 0.945, 0.945, 0.95, 0.95, 0.958, 0.958, 0.958];
export let nema_min_P = [1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 5.5, 7.5, 10.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 75.0, 100.0, 125.0, 150.0, 175.0, 200.0, 250.0, 300.0, 350.0, 400.0, 450.0, 500.0];
let nema_min_full_open_2p  = [0.755, 0.825, 0.84, 0.84, 0.84, 0.855, 0.855, 0.875, 0.885, 0.895, 0.902, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.93, 0.936, 0.936, 0.945, 0.945, 0.945, 0.95, 0.95, 0.954, 0.958, 0.958];
let nema_min_full_open_4p = [0.825, 0.84, 0.84, 0.865, 0.865, 0.875, 0.875, 0.885, 0.895, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.941, 0.941, 0.945, 0.95, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.958, 0.958];
let nema_min_full_open_6p = [0.8, 0.84, 0.855, 0.865, 0.865, 0.875, 0.875, 0.885, 0.902, 0.902, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.945, 0.945, 0.945, 0.954, 0.954, 0.954, 0.954, 0.954, 0.954];
let nema_min_full_open_8p = [0.74, 0.755, 0.855, 0.865, 0.865, 0.875, 0.875, 0.885, 0.895, 0.895, 0.902, 0.902, 0.91, 0.91, 0.917, 0.924, 0.936, 0.936, 0.936, 0.936, 0.936, 0.936, 0.945, 0.945, 0.945, 0.945, 0.945, 0.945];
let nema_min_full_closed_2p = [0.755, 0.825, 0.84, 0.855, 0.855, 0.875, 0.875, 0.885, 0.895, 0.902, 0.902, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.945, 0.945, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.954, 0.954];
let nema_min_full_closed_4p = [0.825, 0.84, 0.84, 0.875, 0.875, 0.875, 0.875, 0.895, 0.895, 0.91, 0.91, 0.924, 0.924, 0.93, 0.93, 0.936, 0.941, 0.945, 0.945, 0.95, 0.95, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.958];
let nema_min_full_closed_6p = [0.8, 0.855, 0.865, 0.875, 0.875, 0.875, 0.875, 0.895, 0.895, 0.902, 0.902, 0.917, 0.917, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95];
let nema_min_full_closed_8p = [0.74, 0.77, 0.825, 0.84, 0.84, 0.855, 0.855, 0.855, 0.885, 0.885, 0.895, 0.895, 0.91, 0.91, 0.917, 0.917, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.945, 0.945, 0.945, 0.945, 0.945, 0.945];
let nema_min_full_open_2p_i = (nema_min_P, nema_min_full_open_2p);
let nema_min_full_open_4p_i = (nema_min_P, nema_min_full_open_4p);
let nema_min_full_open_6p_i = (nema_min_P, nema_min_full_open_6p);
let nema_min_full_open_8p_i = (nema_min_P, nema_min_full_open_8p);
let nema_min_full_closed_2p_i = (nema_min_P, nema_min_full_closed_2p);
let nema_min_full_closed_4p_i = (nema_min_P, nema_min_full_closed_4p);
let nema_min_full_closed_6p_i = (nema_min_P, nema_min_full_closed_6p);
let nema_min_full_closed_8p_i = (nema_min_P, nema_min_full_closed_8p);
export function CSA_motor_efficiency({P, closed=false, poles=2, high_efficiency=false}) {
    P = P/hp;
    // This could be replaced by a dict and a jump list
    let efficiency;
    if( high_efficiency ) {
        if( closed ) {
            if( poles === 2 ) { efficiency = interp(P, nema_high_P, nema_high_full_closed_2p); } 
            else if( poles === 4 ) { efficiency = interp(P, nema_high_P, nema_high_full_closed_4p); } 
            else if( poles === 6 ) { efficiency = interp(P, nema_high_P, nema_high_full_closed_6p); }
        }
        else {
            if( poles === 2 ) { efficiency = interp(P, nema_high_P, nema_high_full_open_2p); } 
            else if( poles === 4 ) { efficiency = interp(P, nema_high_P, nema_high_full_open_4p); } 
            else if( poles === 6 ) { efficiency = interp(P, nema_high_P, nema_high_full_open_6p); }
        }
    } else {
        if( closed ) {
            if( poles === 2 ) { efficiency = interp(P, nema_min_P, nema_min_full_closed_2p); } 
            else if( poles === 4 ) { efficiency = interp(P, nema_min_P, nema_min_full_closed_4p); } 
            else if( poles === 6 ) { efficiency = interp(P, nema_min_P, nema_min_full_closed_6p); } 
            else if( poles === 8 ) { efficiency = interp(P, nema_min_P, nema_min_full_closed_8p); }
        } 
        else {
            if( poles === 2 ) { efficiency = interp(P, nema_min_P, nema_min_full_open_2p); } 
            else if( poles === 4 ) { efficiency = interp(P, nema_min_P, nema_min_full_open_4p); } 
            else if( poles === 6 ) { efficiency = interp(P, nema_min_P, nema_min_full_open_6p); } 
            else if( poles === 8 ) { efficiency = interp(P, nema_min_P, nema_min_full_open_8p); }
        }
    }
    return round(efficiency, 4);
}
let _to_1 = [0.015807118828266818, 4.3158627514876216, -8.5612097969025438, 8.2040355039147386, -3.0147603718043068];
let _to_5 = [0.015560190519232379, 4.5699731811493152, -7.6800154569463883, 5.4701698738380813, -1.3630071852989643];
let _to_10 = [0.059917274403963446, 6.356781885851186, -17.099192527703369, 20.707077651470666, -9.2215133149377841];
let _to_25 = [0.29536141765389839, 4.9918188632064329, -13.785081664656504, 16.908273659093812, -7.5816775136809609];
let _to_60 = [0.46934299949154384, 4.0298663805446004, -11.632822556859477, 14.616967043793032, -6.6284514347522245];
let _to_infty = [0.68235730304242914, 2.4402956771025748, -6.8306770996860182, 8.2108432911172713, -3.5629309804411577];
let _efficiency_lists = [_to_1, _to_5, _to_10, _to_25, _to_60, _to_infty];
let _efficiency_ones = [0.9218102, 0.64307597, 0.61724113, 0.61569791, 0.6172238, 0.40648294];
export function motor_efficiency_underloaded({P, load=0.5}) {
    P = P/hp;
    let i;
    if( P <= 1.0 ) { i = 0; } 
    else if( P <= 5.0 ) { i = 1; } 
    else if( P <= 10.0 ) { i = 2; } 
    else if( P <= 25.0 ) { i = 3; } 
    else if( P <= 60 ) { i = 4; } 
    else { i = 5; }
    if( load > _efficiency_ones[i] ) { return 1; }
    else {
        let cs = _efficiency_lists[i];
        return cs[0] + cs[1]*load + cs[2]*load**2 + cs[3]*load**3 + cs[4]*load**4;
    }
}
export function specific_speed({Q, H, n=3600.}) {
    return n*Math.sqrt(Q)/H**0.75;
}
export function specific_diameter({Q, H, D}) {
    return D*Math.sqrt(Math.sqrt(H)/Q);
}
export function speed_synchronous({f, poles=2, phase=3}) {
    return 120.*f*phase/poles;
}
export function current_ideal({P, V, phase=3, PF=1}) {
    if( [1, 3].indexOf(phase) < 0 ) {
        throw new Error( 'ValueError - Only 1 and 3 phase power supported' );
    }
    if( phase === 3 ) {
        return P/(V*Math.sqrt(3)*PF);
    } else {
        return P/(V*PF);
    }
}
export class CountryPower {
    __slots__ = ('plugs', 'voltage', 'freq', 'country');
    toString() {
        return `CountryPower(country="${this.plugs}", voltage=${this.voltage}, freq=${this.freq}, plugs=${this.country})`;
    }
    constructor({country, voltage, freq, plugs=null}) {
        this.plugs = plugs;
        this.voltage = voltage;
        this.freq = freq;
        this.country = country;
    }
}
export let residential_power = {
    "at": new CountryPower({country: "Austria", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "bj": new CountryPower({country: "Benin", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "gh": new CountryPower({country: "Ghana", voltage: 230, freq: 50, plugs: ['D', 'G']}),
    "sc": new CountryPower({country: "Seychelles", voltage: 240, freq: 50, plugs: ['G',]}),
    "bg": new CountryPower({country: "Bulgaria", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "me": new CountryPower({country: "Montenegro", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "fo": new CountryPower({country: "Faroe Islands", voltage: 230, freq: 50, plugs: ['C', 'E', 'F', 'K']}),
    "ne": new CountryPower({country: "Niger", voltage: 220, freq: 50, plugs: ['A', 'B', 'C', 'D', 'E', 'F']}),
    "za": new CountryPower({country: "South Africa", voltage: 230, freq: 50, plugs: ['C', 'F', 'M', 'N']}),
    "az": new CountryPower({country: "Azerbaijan", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "so": new CountryPower({country: "Somalia", voltage: 220, freq: 50, plugs: ['C',]}),
    "sn": new CountryPower({country: "Senegal", voltage: 230, freq: 50, plugs: ['C', 'D', 'E', 'K']}),
    "np": new CountryPower({country: "Nepal", voltage: 230, freq: 50, plugs: ['C', 'D', 'M']}),
    "sl": new CountryPower({country: "Sierra Leone", voltage: 230, freq: 50, plugs: ['D', 'G']}),
    "be": new CountryPower({country: "Belgium", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "vg": new CountryPower({country: "British Virgin Islands", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "bz": new CountryPower({country: "Belize", voltage: 110, freq: 60, plugs: ['A', 'B', 'G']}),
    "tw": new CountryPower({country: "Taiwan", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "bf": new CountryPower({country: "Burkina Faso", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "ao": new CountryPower({country: "Angola", voltage: 220, freq: 50, plugs: ['C',]}),
    "gi": new CountryPower({country: "Gibraltar", voltage: 240, freq: 50, plugs: ['C', 'G']}),
    "ee": new CountryPower({country: "Estonia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "bs": new CountryPower({country: "Bahamas", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "ir": new CountryPower({country: "Iran", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "sv": new CountryPower({country: "El Salvador", voltage: 115, freq: 60, plugs: ['A', 'B']}),
    "am": new CountryPower({country: "Armenia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "is": new CountryPower({country: "Iceland", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "uy": new CountryPower({country: "Uruguay", voltage: 230, freq: 50, plugs: ['C', 'F', 'I', 'L']}),
    "mc": new CountryPower({country: "Monaco", voltage: 230, freq: 50, plugs: ['C', 'D', 'E', 'F']}),
    "jm": new CountryPower({country: "Jamaica", voltage: 110, freq: 50, plugs: ['A', 'B']}),
    "im": new CountryPower({country: "Isle of Man", voltage: 240, freq: 50, plugs: ['G',]}),
    "dm": new CountryPower({country: "Dominica", voltage: 230, freq: 50, plugs: ['D', 'G']}),
    "mu": new CountryPower({country: "Mauritius", voltage: 230, freq: 50, plugs: ['C', 'G']}),
    "cz": new CountryPower({country: "Czech Republic", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "kh": new CountryPower({country: "Cambodia", voltage: 230, freq: 50, plugs: ['A', 'C', 'G']}),
    "cf": new CountryPower({country: "Central African Republic", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "se": new CountryPower({country: "Sweden", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "uz": new CountryPower({country: "Uzbekistan", voltage: 220, freq: 50, plugs: ['C', 'I']}),
    "sk": new CountryPower({country: "Slovakia", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "ky": new CountryPower({country: "Cayman Islands", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "tn": new CountryPower({country: "Tunisia", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "do": new CountryPower({country: "Dominican Republic", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "hu": new CountryPower({country: "Hungary", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "af": new CountryPower({country: "Afghanistan", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "et": new CountryPower({country: "Ethiopia", voltage: 220, freq: 50, plugs: ['C', 'E', 'F', 'L']}),
    "tv": new CountryPower({country: "Tuvalu", voltage: 220, freq: 50, plugs: ['I',]}),
    "ad": new CountryPower({country: "Andorra", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "hn": new CountryPower({country: "Honduras", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "ls": new CountryPower({country: "Lesotho", voltage: 220, freq: 50, plugs: ['M',]}),
    "na": new CountryPower({country: "Namibia", voltage: 220, freq: 50, plugs: ['D', 'M']}),
    "jo": new CountryPower({country: "Jordan", voltage: 230, freq: 50, plugs: ['B', 'C', 'D', 'F', 'G', 'J']}),
    "pl": new CountryPower({country: "Poland", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "bt": new CountryPower({country: "Bhutan", voltage: 230, freq: 50, plugs: ['C', 'D', 'F', 'G', 'M']}),
    "fm": new CountryPower({country: "Micronesia", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "no": new CountryPower({country: "Norway", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "fk": new CountryPower({country: "Falkland Islands", voltage: 240, freq: 50, plugs: ['G',]}),
    "je": new CountryPower({country: "Jersey", voltage: 230, freq: 50, plugs: ['G',]}),
    "ye": new CountryPower({country: "Yemen", voltage: 230, freq: 50, plugs: ['A', 'D', 'G']}),
    "cm": new CountryPower({country: "Cameroon", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "md": new CountryPower({country: "Moldova", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "cn": new CountryPower({country: "China", voltage: 220, freq: 50, plugs: ['A', 'I', 'C']}),
    "gm": new CountryPower({country: "Gambia", voltage: 230, freq: 50, plugs: ['G',]}),
    "sg": new CountryPower({country: "Singapore", voltage: 230, freq: 50, plugs: ['C', 'G', 'M']}),
    "tj": new CountryPower({country: "Tajikistan", voltage: 220, freq: 50, plugs: ['C', 'F', 'I']}),
    "gt": new CountryPower({country: "Guatemala", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "ma": new CountryPower({country: "Morocco", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "mv": new CountryPower({country: "Maldives", voltage: 230, freq: 50, plugs: ['D', 'G', 'J', 'K', 'L']}),
    "ga": new CountryPower({country: "Gabon", voltage: 220, freq: 50, plugs: ['C',]}),
    "bo": new CountryPower({country: "Bolivia", voltage: 115, freq: 50, plugs: ['A', 'C']}),
    "ly": new CountryPower({country: "Libya", voltage: 127, freq: 50, plugs: ['C', 'D', 'F', 'L']}),
    "rw": new CountryPower({country: "Rwanda", voltage: 230, freq: 50, plugs: ['C', 'J']}),
    "cg": new CountryPower({country: "Congo, Republic of the", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "kz": new CountryPower({country: "Kazakhstan", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "jp": new CountryPower({country: "Japan", voltage: 100, freq: 50, plugs: ['A', 'B']}),
    "co": new CountryPower({country: "Colombia", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "sm": new CountryPower({country: "San Marino", voltage: 230, freq: 50, plugs: ['C', 'F', 'L']}),
    "rs": new CountryPower({country: "Serbia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "gw": new CountryPower({country: "Guinea-Bissau", voltage: 220, freq: 50, plugs: ['C',]}),
    "kr": new CountryPower({country: "South Korea", voltage: 220, freq: 60, plugs: ['C', 'F']}),
    "py": new CountryPower({country: "Paraguay", voltage: 220, freq: 50, plugs: ['C',]}),
    "lt": new CountryPower({country: "Lithuania", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "tr": new CountryPower({country: "Turkey", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "pa": new CountryPower({country: "Panama", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "ba": new CountryPower({country: "Bosnia and Herzegovina", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "vn": new CountryPower({country: "Vietnam", voltage: 220, freq: 50, plugs: ['A', 'C', 'G']}),
    "iq": new CountryPower({country: "Iraq", voltage: 230, freq: 50, plugs: ['C', 'D', 'G']}),
    "pk": new CountryPower({country: "Pakistan", voltage: 230, freq: 50, plugs: ['C', 'D', 'G', 'M']}),
    "li": new CountryPower({country: "Liechtenstein", voltage: 230, freq: 50, plugs: ['C', 'J']}),
    "mz": new CountryPower({country: "Mozambique", voltage: 220, freq: 50, plugs: ['C', 'F', 'M']}),
    "au": new CountryPower({country: "Australia", voltage: 230, freq: 50, plugs: ['I',]}),
    "ws": new CountryPower({country: "Samoa", voltage: 230, freq: 50, plugs: ['I',]}),
    "sr": new CountryPower({country: "Suriname", voltage: 127, freq: 60, plugs: ['C', 'F']}),
    "mn": new CountryPower({country: "Mongolia", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "bw": new CountryPower({country: "Botswana", voltage: 230, freq: 50, plugs: ['D', 'G', 'M']}),
    "gb": new CountryPower({country: "United Kingdom", voltage: 230, freq: 50, plugs: ['G',]}),
    "pg": new CountryPower({country: "Papua New Guinea", voltage: 240, freq: 50, plugs: ['I',]}),
    "dj": new CountryPower({country: "Djibouti", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "th": new CountryPower({country: "Thailand", voltage: 220, freq: 50, plugs: ['A', 'B', 'C', 'F']}),
    "us": new CountryPower({country: "United States", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "gr": new CountryPower({country: "Greece", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "kn": new CountryPower({country: "St. Kitts and Nevis", voltage: 110, freq: 60, plugs: ['A', 'B', 'D', 'G']}),
    "ug": new CountryPower({country: "Uganda", voltage: 240, freq: 50, plugs: ['G',]}),
    "ie": new CountryPower({country: "Ireland", voltage: 230, freq: 50, plugs: ['G',]}),
    "tg": new CountryPower({country: "Togo", voltage: 220, freq: 50, plugs: ['C',]}),
    "td": new CountryPower({country: "Chad", voltage: 220, freq: 50, plugs: ['C', 'D', 'E', 'F']}),
    "la": new CountryPower({country: "Laos", voltage: 230, freq: 50, plugs: ['C', 'E', 'F']}),
    "sy": new CountryPower({country: "Syria", voltage: 220, freq: 50, plugs: ['C', 'E', 'L']}),
    "bm": new CountryPower({country: "Bermuda", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "il": new CountryPower({country: "Israel", voltage: 230, freq: 50, plugs: ['C', 'H', 'M']}),
    "nz": new CountryPower({country: "New Zealand", voltage: 230, freq: 50, plugs: ['I',]}),
    "mg": new CountryPower({country: "Madagascar", voltage: 220, freq: 50, plugs: ['C', 'D', 'E', 'J', 'K']}),
    "ve": new CountryPower({country: "Venezuela", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "dk": new CountryPower({country: "Denmark", voltage: 230, freq: 50, plugs: ['C', 'E', 'F', 'K']}),
    "lb": new CountryPower({country: "Lebanon", voltage: 220, freq: 50, plugs: ['A', 'B', 'C', 'D', 'G']}),
    "kp": new CountryPower({country: "North Korea", voltage: 110, freq: 60, plugs: ['A', 'C', 'F']}),
    "vu": new CountryPower({country: "Vanuatu", voltage: 220, freq: 50, plugs: ['C', 'G', 'I']}),
    "cu": new CountryPower({country: "Cuba", voltage: 110, freq: 60, plugs: ['A', 'B', 'C']}),
    "pt": new CountryPower({country: "Portugal", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "kw": new CountryPower({country: "Kuwait", voltage: 240, freq: 50, plugs: ['C', 'G']}),
    "cd": new CountryPower({country: "Congo, Democratic Republic of the", voltage: 220, freq: 50, plugs: ['C', 'D', 'E']}),
    "nr": new CountryPower({country: "Nauru", voltage: 240, freq: 50, plugs: ['I',]}),
    "si": new CountryPower({country: "Slovenia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "bd": new CountryPower({country: "Bangladesh", voltage: 220, freq: 50, plugs: ['C', 'D', 'G', 'K']}),
    "al": new CountryPower({country: "Albania", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "ec": new CountryPower({country: "Ecuador", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "gy": new CountryPower({country: "Guyana", voltage: 110, freq: 60, plugs: ['A', 'B', 'D', 'G']}),
    "bb": new CountryPower({country: "Barbados", voltage: 115, freq: 50, plugs: ['A', 'B']}),
    "ke": new CountryPower({country: "Kenya", voltage: 240, freq: 50, plugs: ['G',]}),
    "mx": new CountryPower({country: "Mexico", voltage: 127, freq: 60, plugs: ['A', 'B']}),
    "gq": new CountryPower({country: "Equatorial Guinea", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "gn": new CountryPower({country: "Guinea", voltage: 220, freq: 50, plugs: ['C', 'F', 'K']}),
    "bi": new CountryPower({country: "Burundi", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "lv": new CountryPower({country: "Latvia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "fj": new CountryPower({country: "Fiji", voltage: 240, freq: 50, plugs: ['I',]}),
    "ci": new CountryPower({country: "Côte d'Ivoire", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "ai": new CountryPower({country: "Anguilla", voltage: 110, freq: 60, plugs: ['A',]}),
    "gu": new CountryPower({country: "Guam", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "lr": new CountryPower({country: "Liberia", voltage: 120, freq: 60, plugs: ['A', 'B', 'C', 'E', 'F']}),
    "br": new CountryPower({country: "Brazil", voltage: 220, freq: 60, plugs: ['C', 'N']}),
    "cv": new CountryPower({country: "Cape Verde", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "cl": new CountryPower({country: "Chile", voltage: 220, freq: 50, plugs: ['L',]}),
    "in": new CountryPower({country: "India", voltage: 230, freq: 50, plugs: ['C', 'D', 'M']}),
    "gg": new CountryPower({country: "Guernsey", voltage: 230, freq: 50, plugs: ['G',]}),
    "tt": new CountryPower({country: "Trinidad & Tobago", voltage: 115, freq: 60, plugs: ['A', 'B']}),
    "de": new CountryPower({country: "Germany", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "qa": new CountryPower({country: "Qatar", voltage: 240, freq: 50, plugs: ['D', 'G']}),
    "ph": new CountryPower({country: "Philippines", voltage: 220, freq: 60, plugs: ['A', 'B']}),
    "sd": new CountryPower({country: "Sudan", voltage: 230, freq: 50, plugs: ['C', 'D']}),
    "mm": new CountryPower({country: "Myanmar", voltage: 230, freq: 50, plugs: ['C', 'D', 'F', 'G']}),
    "gd": new CountryPower({country: "Grenada", voltage: 230, freq: 50, plugs: ['G',]}),
    "st": new CountryPower({country: "São Tomé and Príncipe", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "sz": new CountryPower({country: "Swaziland", voltage: 230, freq: 50, plugs: ['M',]}),
    "ro": new CountryPower({country: "Romania", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "xk": new CountryPower({country: "Kosovo", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "cy": new CountryPower({country: "Cyprus", voltage: 240, freq: 50, plugs: ['G',]}),
    "dz": new CountryPower({country: "Algeria", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "zm": new CountryPower({country: "Zambia", voltage: 230, freq: 50, plugs: ['C', 'D', 'G']}),
    "by": new CountryPower({country: "Belarus", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "hr": new CountryPower({country: "Croatia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "lu": new CountryPower({country: "Luxembourg", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "fi": new CountryPower({country: "Finland", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "zw": new CountryPower({country: "Zimbabwe", voltage: 220, freq: 50, plugs: ['D', 'G']}),
    "km": new CountryPower({country: "Comoros", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "tl": new CountryPower({country: "Timor-Leste ", voltage: 220, freq: 50, plugs: ['C', 'E', 'F', 'I']}),
    "tz": new CountryPower({country: "Tanzania", voltage: 230, freq: 50, plugs: ['D', 'G']}),
    "ht": new CountryPower({country: "Haiti", voltage: 110, freq: 60, plugs: ['A', 'B']}),
    "vc": new CountryPower({country: "St. Vincent and the Grenadines", voltage: 230, freq: 50, plugs: ['C', 'E', 'G', 'I', 'K']}),
    "es": new CountryPower({country: "Spain", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "my": new CountryPower({country: "Malaysia", voltage: 230, freq: 50, plugs: ['C', 'G', 'M']}),
    "lc": new CountryPower({country: "St. Lucia", voltage: 240, freq: 50, plugs: ['G',]}),
    "tm": new CountryPower({country: "Turkmenistan", voltage: 220, freq: 50, plugs: ['B', 'C', 'F']}),
    "pe": new CountryPower({country: "Peru", voltage: 220, freq: 60, plugs: ['A', 'B', 'C']}),
    "ua": new CountryPower({country: "Ukraine", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "eg": new CountryPower({country: "Egypt", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "sb": new CountryPower({country: "Solomon Islands", voltage: 220, freq: 50, plugs: ['I', 'G']}),
    "to": new CountryPower({country: "Tonga", voltage: 240, freq: 50, plugs: ['I',]}),
    "fr": new CountryPower({country: "France", voltage: 230, freq: 50, plugs: ['C', 'E']}),
    "ng": new CountryPower({country: "Nigeria", voltage: 240, freq: 50, plugs: ['D', 'G']}),
    "sh": new CountryPower({country: "Saint Helena, Ascension and Tristan da Cunha", voltage: 240, freq: 50, plugs: ['G',]}),
    "mw": new CountryPower({country: "Malawi", voltage: 230, freq: 50, plugs: ['G',]}),
    "ms": new CountryPower({country: "Montserrat", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "ae": new CountryPower({country: "United Arab Emirates", voltage: 220, freq: 50, plugs: ['C', 'D', 'G']}),
    "nl": new CountryPower({country: "Netherlands", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "id": new CountryPower({country: "Indonesia", voltage: 230, freq: 50, plugs: ['C', 'F', 'G']}),
    "ru": new CountryPower({country: "Russia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "ar": new CountryPower({country: "Argentina", voltage: 220, freq: 50, plugs: ['C', 'I']}),
    "bn": new CountryPower({country: "Brunei", voltage: 240, freq: 50, plugs: ['G',]}),
    "pw": new CountryPower({country: "Palau", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "kg": new CountryPower({country: "Kyrgyzstan", voltage: 220, freq: 50, plugs: ['C', 'F']}),
    "bh": new CountryPower({country: "Bahrain", voltage: 230, freq: 50, plugs: ['G',]}),
    "ml": new CountryPower({country: "Mali", voltage: 220, freq: 50, plugs: ['C', 'E']}),
    "it": new CountryPower({country: "Italy", voltage: 230, freq: 50, plugs: ['C', 'F', 'L']}),
    "sa": new CountryPower({country: "Saudi Arabia", voltage: 220, freq: 60, plugs: ['A', 'B', 'G']}),
    "ag": new CountryPower({country: "Antigua and Barbuda", voltage: 230, freq: 60, plugs: ['A', 'B']}),
    "mr": new CountryPower({country: "Mauritania", voltage: 220, freq: 50, plugs: ['C',]}),
    "om": new CountryPower({country: "Oman", voltage: 240, freq: 50, plugs: ['C', 'G']}),
    "lk": new CountryPower({country: "Sri Lanka", voltage: 230, freq: 50, plugs: ['D', 'G', 'M']}),
    "er": new CountryPower({country: "Eritrea", voltage: 230, freq: 50, plugs: ['C', 'L']}),
    "mk": new CountryPower({country: "Macedonia", voltage: 230, freq: 50, plugs: ['C', 'F']}),
    "ni": new CountryPower({country: "Nicaragua", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "ch": new CountryPower({country: "Switzerland", voltage: 230, freq: 50, plugs: ['C', 'J']}),
    "ca": new CountryPower({country: "Canada", voltage: 120, freq: 60, plugs: ['A', 'B']}),
    "cr": new CountryPower({country: "Costa Rica", voltage: 120, freq: 60, plugs: ['A', 'B']})
};
/*Dictionary of country-code to CountryPower instances for residential use.*/
let CONST_380 = 380;
let CONST_400 = 400;
let CONST_415 = 415;
let CONST_440 = 440;
let CONST_480 = 480;
let TUP_190 = [190];
let TUP_208 = [208];
let TUP_240 = [240];
let TUP_380 = [CONST_380];
let TUP_400 = [CONST_400];
let TUP_415 = [CONST_415];
export let industrial_power = {
    "at": new CountryPower({country: 'Austria', voltage: TUP_400, freq: 50}),
    "bj": new CountryPower({country: 'Benin', voltage: TUP_380, freq: 50}),
    "gh": new CountryPower({country: 'Ghana', voltage: TUP_400, freq: 50}),
    "sc": new CountryPower({country: 'Seychelles', voltage: TUP_240, freq: 50}),
    "bg": new CountryPower({country: 'Bulgaria', voltage: TUP_400, freq: 50}),
    "me": new CountryPower({country: 'Montenegro', voltage: TUP_400, freq: 50}),
    "fo": new CountryPower({country: 'Faeroe Islands', voltage: TUP_400, freq: 50}),
    "iq": new CountryPower({country: 'Iraq', voltage: TUP_400, freq: 50}),
    "ne": new CountryPower({country: 'Niger', voltage: TUP_380, freq: 50}),
    "za": new CountryPower({country: 'South Africa', voltage: TUP_400, freq: 50}),
    "az": new CountryPower({country: 'Azerbaijan', voltage: TUP_380, freq: 50}),
    "so": new CountryPower({country: 'Somalia', voltage: TUP_380, freq: 50}),
    "sn": new CountryPower({country: 'Senegal', voltage: TUP_400, freq: 50}),
    "np": new CountryPower({country: 'Nepal', voltage: TUP_400, freq: 50}),
    "sl": new CountryPower({country: 'Sierra Leone', voltage: TUP_400, freq: 50}),
    "be": new CountryPower({country: 'Belgium', voltage: TUP_400, freq: 50}),
    "vg": new CountryPower({country: 'British Virgin Islands', voltage: TUP_190, freq: 60}),
    "bz": new CountryPower({country: 'Belize', voltage: null, freq: 60, plugs: [190, CONST_380]}),
    "tw": new CountryPower({country: 'Taiwan', voltage: null, freq: 60, plugs: [220,]}),
    "bf": new CountryPower({country: 'Burkina Faso', voltage: TUP_380, freq: 50}),
    "ao": new CountryPower({country: 'Angola', voltage: TUP_380, freq: 50}),
    "ee": new CountryPower({country: 'Estonia', voltage: TUP_400, freq: 50}),
    "bs": new CountryPower({country: 'Bahamas', voltage: TUP_208, freq: 60}),
    "ir": new CountryPower({country: 'Iran', voltage: TUP_400, freq: 50}),
    "sv": new CountryPower({country: 'El Salvador', voltage: null, freq: 60, plugs: [200,]}),
    "am": new CountryPower({country: 'Armenia', voltage: TUP_400, freq: 50}),
    "is": new CountryPower({country: 'Iceland', voltage: TUP_400, freq: 50}),
    "uy": new CountryPower({country: 'Uruguay', voltage: TUP_380, freq: 50}),
    "mc": new CountryPower({country: 'Monaco', voltage: TUP_400, freq: 50}),
    "jm": new CountryPower({country: 'Jamaica', voltage: TUP_190, freq: 50}),
    "im": new CountryPower({country: 'Isle of Man', voltage: TUP_415, freq: 50}),
    "dm": new CountryPower({country: 'Dominica', voltage: TUP_400, freq: 50}),
    "mu": new CountryPower({country: 'Mauritius', voltage: TUP_400, freq: 50}),
    "cz": new CountryPower({country: 'Czech Republic', voltage: TUP_400, freq: 50}),
    "kh": new CountryPower({country: 'Cambodia', voltage: TUP_400, freq: 50}),
    "cf": new CountryPower({country: 'Central African Republic', voltage: TUP_380, freq: 50}),
    "se": new CountryPower({country: 'Sweden', voltage: TUP_400, freq: 50}),
    "uz": new CountryPower({country: 'Uzbekistan', voltage: TUP_380, freq: 50}),
    "sk": new CountryPower({country: 'Slovakia', voltage: TUP_400, freq: 50}),
    "ky": new CountryPower({country: 'Cayman Islands', voltage: TUP_240, freq: 60}),
    "tn": new CountryPower({country: 'Tunisia', voltage: TUP_400, freq: 50}),
    "hu": new CountryPower({country: 'Hungary', voltage: TUP_400, freq: 50}),
    "af": new CountryPower({country: 'Afghanistan', voltage: TUP_380, freq: 50}),
    "tc": new CountryPower({country: 'Turks and Caicos Islands', voltage: TUP_240, freq: 60}),
    "et": new CountryPower({country: 'Ethiopia', voltage: TUP_380, freq: 50}),
    "sd": new CountryPower({country: 'Sudan', voltage: TUP_400, freq: 50}),
    "ad": new CountryPower({country: 'Andorra', voltage: TUP_400, freq: 50}),
    "hn": new CountryPower({country: 'Honduras', voltage: null, freq: 60, plugs: [208, 230, 240, 460, CONST_480]}),
    "ls": new CountryPower({country: 'Lesotho', voltage: TUP_380, freq: 50}),
    "na": new CountryPower({country: 'Namibia', voltage: TUP_380, freq: 50}),
    "pl": new CountryPower({country: 'Poland', voltage: TUP_400, freq: 50}),
    "bt": new CountryPower({country: 'Bhutan', voltage: TUP_400, freq: 50}),
    "sa": new CountryPower({country: 'Saudi Arabia', voltage: TUP_400, freq: 60}),
    "no": new CountryPower({country: 'Norway', voltage: null, freq: 50, plugs: [230, 400]}),
    "fk": new CountryPower({country: 'Falkland Islands', voltage: TUP_415, freq: 50}),
    "ye": new CountryPower({country: 'Yemen', voltage: TUP_400, freq: 50}),
    "gi": new CountryPower({country: 'Gibraltar', voltage: TUP_400, freq: 50}),
    "md": new CountryPower({country: 'Moldova', voltage: TUP_400, freq: 50}),
    "cn": new CountryPower({country: 'China', voltage: TUP_380, freq: 50}),
    "gm": new CountryPower({country: 'Gambia', voltage: TUP_400, freq: 50}),
    "sg": new CountryPower({country: 'Singapore', voltage: TUP_400, freq: 50}),
    "tj": new CountryPower({country: 'Tajikistan', voltage: TUP_380, freq: 50}),
    "gt": new CountryPower({country: 'Guatemala', voltage: TUP_208, freq: 60}),
    "ma": new CountryPower({country: 'Morocco', voltage: TUP_380, freq: 50}),
    "mv": new CountryPower({country: 'Maldives', voltage: TUP_400, freq: 50}),
    "ga": new CountryPower({country: 'Gabon', voltage: TUP_380, freq: 50}),
    "bo": new CountryPower({country: 'Bolivia', voltage: TUP_400, freq: 50}),
    "ly": new CountryPower({country: 'Libya', voltage: TUP_400, freq: 50}),
    "rw": new CountryPower({country: 'Rwanda', voltage: TUP_400, freq: 50}),
    "cg": new CountryPower({country: "People's Republic of Congo", voltage: TUP_400, freq: 50}),
    "kz": new CountryPower({country: 'Kazakhstan', voltage: TUP_380, freq: 50}),
    "jp": new CountryPower({country: 'Japan', voltage: null, freq: 50, plugs: [200,]}),
    "co": new CountryPower({country: 'Colombia', voltage: null, freq: 60, plugs: [220, 440]}),
    "sm": new CountryPower({country: 'San Marino', voltage: TUP_400, freq: 50}),
    "rs": new CountryPower({country: 'Serbia', voltage: TUP_400, freq: 50}),
    "gw": new CountryPower({country: 'Guinea-Bissau', voltage: TUP_380, freq: 50}),
    "kr": new CountryPower({country: 'South Korea', voltage: TUP_380, freq: 60}),
    "py": new CountryPower({country: 'Paraguay', voltage: TUP_380, freq: 50}),
    "lt": new CountryPower({country: 'Lithuania', voltage: TUP_400, freq: 50}),
    "tr": new CountryPower({country: 'Turkey', voltage: TUP_400, freq: 50}),
    "ss": new CountryPower({country: 'South Sudan', voltage: TUP_400, freq: 50}),
    "ba": new CountryPower({country: 'Bosnia & Herzegovina', voltage: TUP_400, freq: 50}),
    "vn": new CountryPower({country: 'Vietnam', voltage: TUP_380, freq: 50}),
    "do": new CountryPower({country: 'Dominican Republic', voltage: null, freq: 60, plugs: [120, 208, 277, 480]}),
    "pk": new CountryPower({country: 'Pakistan', voltage: TUP_400, freq: 50}),
    "li": new CountryPower({country: 'Liechtenstein', voltage: TUP_400, freq: 50}),
    "mz": new CountryPower({country: 'Mozambique', voltage: TUP_380, freq: 50}),
    "au": new CountryPower({country: 'Australia', voltage: TUP_400, freq: 50}),
    "ws": new CountryPower({country: 'Samoa', voltage: TUP_400, freq: 50}),
    "sr": new CountryPower({country: 'Suriname', voltage: null, freq: 60, plugs: [220, 400,]}),
    "mn": new CountryPower({country: 'Mongolia', voltage: TUP_400, freq: 50}),
    "bw": new CountryPower({country: 'Botswana', voltage: TUP_400, freq: 50}),
    "gb": new CountryPower({country: 'United Kingdom', voltage: TUP_415, freq: 50}),
    "pg": new CountryPower({country: 'Papua New Guinea', voltage: TUP_415, freq: 50}),
    "dj": new CountryPower({country: 'Djibouti', voltage: TUP_380, freq: 50}),
    "th": new CountryPower({country: 'Thailand', voltage: TUP_400, freq: 50}),
    "us": new CountryPower({country: 'United States of America', voltage: null, freq: 60, plugs: [120, 208, 277, 480, 120, 240, 240, CONST_480]}),
    "gr": new CountryPower({country: 'Greece', voltage: TUP_400, freq: 50}),
    "ug": new CountryPower({country: 'Uganda', voltage: TUP_415, freq: 50}),
    "ie": new CountryPower({country: 'Ireland', voltage: TUP_415, freq: 50}),
    "tg": new CountryPower({country: 'Togo', voltage: TUP_380, freq: 50}),
    "td": new CountryPower({country: 'Chad', voltage: TUP_380, freq: 50}),
    "la": new CountryPower({country: 'Laos', voltage: TUP_400, freq: 50}),
    "sy": new CountryPower({country: 'Syria', voltage: TUP_380, freq: 50}),
    "bm": new CountryPower({country: 'Bermuda', voltage: TUP_208, freq: 60}),
    "il": new CountryPower({country: 'Israel', voltage: TUP_400, freq: 50}),
    "nz": new CountryPower({country: 'New Zealand', voltage: TUP_400, freq: 50}),
    "mg": new CountryPower({country: 'Madagascar', voltage: TUP_380, freq: 50}),
    "ve": new CountryPower({country: 'Venezuela', voltage: null, freq: 60, plugs: [120,]}),
    "dk": new CountryPower({country: 'Denmark', voltage: TUP_400, freq: 50}),
    "lb": new CountryPower({country: 'Lebanon', voltage: TUP_400, freq: 50}),
    "kp": new CountryPower({country: 'North Korea', voltage: TUP_380, freq: 50}),
    "vu": new CountryPower({country: 'Vanuatu', voltage: TUP_400, freq: 50}),
    "cu": new CountryPower({country: 'Cuba', voltage: null, freq: 60, plugs: [190, 440]}),
    "kw": new CountryPower({country: 'Kuwait', voltage: TUP_415, freq: 50}),
    "cd": new CountryPower({country: 'Democratic Republic of Congo', voltage: TUP_380, freq: 50}),
    "nr": new CountryPower({country: 'Nauru', voltage: TUP_415, freq: 50}),
    "si": new CountryPower({country: 'Slovenia', voltage: TUP_400, freq: 50}),
    "mt": new CountryPower({country: 'Malta', voltage: TUP_400, freq: 50}),
    "bd": new CountryPower({country: 'Bangladesh', voltage: TUP_380, freq: 50}),
    "al": new CountryPower({country: 'Albania', voltage: TUP_400, freq: 50}),
    "ec": new CountryPower({country: 'Ecuador', voltage: TUP_208, freq: 60}),
    "gy": new CountryPower({country: 'Guyana', voltage: TUP_190, freq: 60}),
    "bb": new CountryPower({country: 'Barbados', voltage: null, freq: 50, plugs: [200,]}),
    "ke": new CountryPower({country: 'Kenya', voltage: TUP_415, freq: 50}),
    "mx": new CountryPower({country: 'Mexico', voltage: null, freq: 60, plugs: [220, CONST_480]}),
    "gn": new CountryPower({country: 'Guinea', voltage: TUP_380, freq: 50}),
    "bi": new CountryPower({country: 'Burundi', voltage: TUP_380, freq: 50}),
    "lv": new CountryPower({country: 'Latvia', voltage: TUP_400, freq: 50}),
    "fj": new CountryPower({country: 'Fiji', voltage: TUP_415, freq: 50}),
    "ci": new CountryPower({country: 'Côte d’Ivoire', voltage: TUP_380, freq: 50}),
    "ai": new CountryPower({country: 'Anguilla', voltage: null, freq: 60, plugs: [120, 208, 127, 220, 240, 415]}),
    "gu": new CountryPower({country: 'Guam', voltage: TUP_190, freq: 60}),
    "lr": new CountryPower({country: 'Liberia', voltage: TUP_208, freq: 60}),
    "br": new CountryPower({country: 'Brazil', voltage: null, freq: 60, plugs: [220, 380]}),
    "cv": new CountryPower({country: 'Cape Verde', voltage: TUP_400, freq: 50}),
    "cl": new CountryPower({country: 'Chile', voltage: TUP_380, freq: 50}),
    "in": new CountryPower({country: 'India', voltage: TUP_400, freq: 50}),
    "tt": new CountryPower({country: 'Trinidad & Tobago', voltage: null, freq: 60, plugs: [115, 230, 230, 400]}),
    "de": new CountryPower({country: 'Germany', voltage: TUP_400, freq: 50}),
    "pa": new CountryPower({country: 'Panama', voltage: TUP_240, freq: 60}),
    "qa": new CountryPower({country: 'Qatar', voltage: TUP_415, freq: 50}),
    "ph": new CountryPower({country: 'Philippines', voltage: TUP_380, freq: 60}),
    "jo": new CountryPower({country: 'Jordan', voltage: TUP_400, freq: 50}),
    "mm": new CountryPower({country: 'Myanmar', voltage: TUP_400, freq: 50}),
    "gd": new CountryPower({country: 'Grenada', voltage: TUP_400, freq: 50}),
    "st": new CountryPower({country: 'São Tomé and Príncipe', voltage: TUP_400, freq: 50}),
    "sz": new CountryPower({country: 'Swaziland', voltage: TUP_400, freq: 50}),
    "ro": new CountryPower({country: 'Romania', voltage: TUP_400, freq: 50}),
    "xk": new CountryPower({country: 'Kosovo', voltage: null, freq: 50, plugs: [230, 400]}),
    "cy": new CountryPower({country: 'Cyprus', voltage: TUP_400, freq: 50}),
    "dz": new CountryPower({country: 'Algeria', voltage: TUP_400, freq: 50}),
    "zm": new CountryPower({country: 'Zambia', voltage: TUP_400, freq: 50}),
    "by": new CountryPower({country: 'Belarus', voltage: TUP_380, freq: 50}),
    "hr": new CountryPower({country: 'Croatia', voltage: TUP_400, freq: 50}),
    "lu": new CountryPower({country: 'Luxembourg', voltage: TUP_400, freq: 50}),
    "fi": new CountryPower({country: 'Finland', voltage: TUP_400, freq: 50}),
    "zw": new CountryPower({country: 'Zimbabwe', voltage: TUP_415, freq: 50}),
    "km": new CountryPower({country: 'Comoros', voltage: TUP_380, freq: 50}),
    "tl": new CountryPower({country: 'East Timor', voltage: TUP_380, freq: 50}),
    "tz": new CountryPower({country: 'Tanzania', voltage: TUP_415, freq: 50}),
    "ht": new CountryPower({country: 'Haiti', voltage: TUP_190, freq: 60}),
    "vc": new CountryPower({country: 'Saint Vincent and the Grenadines', voltage: TUP_400, freq: 50}),
    "es": new CountryPower({country: 'Spain', voltage: TUP_400, freq: 50}),
    "my": new CountryPower({country: 'Malaysia', voltage: TUP_415, freq: 50}),
    "lc": new CountryPower({country: 'Saint Lucia', voltage: TUP_400, freq: 50}),
    "tm": new CountryPower({country: 'Turkmenistan', voltage: TUP_380, freq: 50}),
    "pe": new CountryPower({country: 'Peru', voltage: null, freq: 60, plugs: [220,]}),
    "ua": new CountryPower({country: 'Ukraine', voltage: TUP_400, freq: 50}),
    "eg": new CountryPower({country: 'Egypt', voltage: TUP_380, freq: 50}),
    "to": new CountryPower({country: 'Tonga', voltage: TUP_415, freq: 50}),
    "fr": new CountryPower({country: 'France', voltage: TUP_400, freq: 50}),
    "ng": new CountryPower({country: 'Nigeria', voltage: TUP_415, freq: 50}),
    "mw": new CountryPower({country: 'Malawi', voltage: TUP_400, freq: 50}),
    "ms": new CountryPower({country: 'Montserrat', voltage: TUP_400, freq: 60}),
    "ae": new CountryPower({country: 'United Arab Emirates', voltage: TUP_400, freq: 50}),
    "nl": new CountryPower({country: 'Netherlands', voltage: TUP_400, freq: 50}),
    "id": new CountryPower({country: 'Indonesia', voltage: TUP_400, freq: 50}),
    "ru": new CountryPower({country: 'Russia', voltage: TUP_380, freq: 50}),
    "ar": new CountryPower({country: 'Argentina', voltage: TUP_380, freq: 50}),
    "bn": new CountryPower({country: 'Brunei', voltage: TUP_415, freq: 50}),
    "pw": new CountryPower({country: 'Palau', voltage: TUP_208, freq: 60}),
    "kg": new CountryPower({country: 'Kyrgyzstan', voltage: TUP_380, freq: 50}),
    "bh": new CountryPower({country: 'Bahrain', voltage: TUP_400, freq: 50}),
    "ml": new CountryPower({country: 'Mali', voltage: TUP_380, freq: 50}),
    "it": new CountryPower({country: 'Italy', voltage: TUP_400, freq: 50}),
    "cm": new CountryPower({country: 'Cameroon', voltage: TUP_380, freq: 50}),
    "ag": new CountryPower({country: 'Antigua and Barbuda', voltage: TUP_400, freq: 60}),
    "mr": new CountryPower({country: 'Mauritania', voltage: null, freq: 50, plugs: [220,]}),
    "om": new CountryPower({country: 'Oman', voltage: TUP_415, freq: 50}),
    "lk": new CountryPower({country: 'Sri Lanka', voltage: TUP_400, freq: 50}),
    "er": new CountryPower({country: 'Eritrea', voltage: TUP_400, freq: 50}),
    "mk": new CountryPower({country: 'Macedonia, Republic of', voltage: TUP_400, freq: 50}),
    "ni": new CountryPower({country: 'Nicaragua', voltage: TUP_208, freq: 60}),
    "ch": new CountryPower({country: 'Switzerland', voltage: TUP_400, freq: 50}),
    "ca": new CountryPower({country: 'Canada', voltage: null, freq: 60, plugs: [120, 208, 240, CONST_480, 347, 600]}),
    "cr": new CountryPower({country: 'Costa Rica', voltage: TUP_240, freq: 60})
};
/*Dictionary of country-code to CountryPower instances for industrial use.*/
export let electrical_plug_types = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
/*List of all electrical plug types in use around the world.*/
export let voltages_1_phase_residential = [100, 110, 115, 120, 127, 220, 230, 240];
/*List of all AC 1-phase voltages used in residential settings around the world.*/
export let voltages_3_phase = [120, 190, 200, 208, 220, 230, 240, 277, 380, 400, 415, 440, 480];
/*List of all AC 3-phase voltages used in industrial settings around the world.*/
export let residential_power_frequencies = [50, 60];
/*List of all AC 1-phase frequencies used in residential settings around the world.*/
// https://www.grainger.com/content/supplylink-v-belt-maintenance-key-to-electric-motor-efficiency
// Source of values for v belt, notched, and synchronous
// Technology assessment: energy-efficient belt transmissions
// Source of cogged value, their range is 95-98
let V_BELT = 'V';
let COGGED_V_BELT = 'cogged';
let NOTCHED_BELT = 'notched';
let SYNCHRONOUS_BELT = 'synchronous';
let belt_efficiencies = {V_BELT: 0.95, NOTCHED_BELT: 0.97, COGGED_V_BELT: 0.965, SYNCHRONOUS_BELT: 0.98};
let DEEP_GROOVE_BALL = "Deep groove ball";
let ANGULAR_CONTACT_BALL_SINGLE_ROW = "Angular contact ball Single row";
let ANGULAR_CONTACT_BALL_DOUBLE_ROW = "Angular contact ball Double row";
let FOUR_POINT_CONTACT_BALL = "Four point contact ball";
let SELF_ALIGNING_BALL = "Self aligning ball";
let CYLINDRICAL_ROLLER_WITH_CAGE = "Cylindrical roller with cage";
let CYLINDRICAL_ROLLER_FULL_COMPLEMENT = "Cylindrical roller full complement";
let NEEDLE_ROLLER = "Needle roller";
let TAPER_ROLLER = "Taper roller";
let SPHERICAL_ROLLER = "Spherical roller";
let THRUST_BALL = "Thrust ball";
let CYLINDRICAL_ROLLER_THRUST = "Cylindrical roller thrust";
let NEEDLE_ROLLER_THRUST = "Needle roller thrust";
let SPHERICAL_ROLLER_THRUST = "Spherical roller thrust";
let bearing_friction_factors = {DEEP_GROOVE_BALL: 0.0015, ANGULAR_CONTACT_BALL_SINGLE_ROW: 0.002, ANGULAR_CONTACT_BALL_DOUBLE_ROW: 0.0024, FOUR_POINT_CONTACT_BALL: 0.0024, SELF_ALIGNING_BALL: 0.001, CYLINDRICAL_ROLLER_WITH_CAGE: 0.0011, CYLINDRICAL_ROLLER_FULL_COMPLEMENT: 0.002, NEEDLE_ROLLER: 0.0025, TAPER_ROLLER: 0.0018, SPHERICAL_ROLLER: 0.0018, THRUST_BALL: 0.0013, CYLINDRICAL_ROLLER_THRUST: 0.005, NEEDLE_ROLLER_THRUST: 0.005, SPHERICAL_ROLLER_THRUST: 0.0018};
// In m, diameter of fans
let fan_diameters = [0.125, 0.132, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.212, 0.224, 0.236, 0.25, 0.265, 0.28, 0.3, 0.315, 0.335, 0.355, 0.375, 0.4, 0.425, 0.45, 0.475, 0.5, 0.53, 0.56, 0.6, 0.63, 0.67, 0.71, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
let FEG90 = [0.425, 0.448, 0.472, 0.501, 0.527, 0.552, 0.574, 0.594, 0.613, 0.633, 0.652, 0.669, 0.686, 0.703, 0.718, 0.735, 0.746, 0.759, 0.77, 0.779, 0.789, 0.797, 0.804, 0.81, 0.815, 0.819, 0.823, 0.827, 0.83, 0.833, 0.835, 0.837, 0.838, 0.84, 0.841, 0.841, 0.841];
let FEG85 = [0.401, 0.423, 0.446, 0.473, 0.498, 0.521, 0.542, 0.561, 0.579, 0.598, 0.616, 0.631, 0.648, 0.664, 0.678, 0.694, 0.704, 0.717, 0.727, 0.736, 0.745, 0.753, 0.759, 0.765, 0.769, 0.774, 0.777, 0.781, 0.784, 0.786, 0.788, 0.79, 0.791, 0.793, 0.793, 0.794, 0.794];
let FEG80 = [0.378, 0.399, 0.421, 0.447, 0.47, 0.492, 0.511, 0.53, 0.546, 0.565, 0.581, 0.596, 0.612, 0.627, 0.64, 0.655, 0.665, 0.676, 0.686, 0.695, 0.703, 0.711, 0.717, 0.722, 0.726, 0.73, 0.734, 0.738, 0.74, 0.742, 0.744, 0.746, 0.747, 0.748, 0.749, 0.75, 0.75];
let FEG75 = [0.357, 0.377, 0.398, 0.422, 0.444, 0.464, 0.483, 0.5, 0.516, 0.533, 0.549, 0.563, 0.578, 0.592, 0.604, 0.618, 0.628, 0.639, 0.648, 0.656, 0.664, 0.671, 0.677, 0.681, 0.685, 0.689, 0.693, 0.696, 0.698, 0.701, 0.703, 0.704, 0.705, 0.706, 0.707, 0.708, 0.708];
let FEG71 = [0.337, 0.356, 0.375, 0.398, 0.419, 0.438, 0.456, 0.472, 0.487, 0.503, 0.518, 0.531, 0.545, 0.559, 0.57, 0.584, 0.593, 0.603, 0.612, 0.619, 0.627, 0.633, 0.639, 0.643, 0.647, 0.651, 0.654, 0.657, 0.659, 0.661, 0.663, 0.665, 0.666, 0.667, 0.668, 0.668, 0.668];
let FEG67 = [0.318, 0.336, 0.354, 0.376, 0.395, 0.414, 0.43, 0.446, 0.46, 0.475, 0.489, 0.502, 0.515, 0.527, 0.538, 0.551, 0.559, 0.569, 0.577, 0.584, 0.592, 0.598, 0.603, 0.607, 0.611, 0.614, 0.617, 0.621, 0.622, 0.624, 0.626, 0.627, 0.629, 0.63, 0.63, 0.631, 0.631];
let FEG63 = [0.301, 0.317, 0.334, 0.355, 0.373, 0.39, 0.406, 0.421, 0.434, 0.448, 0.462, 0.473, 0.486, 0.498, 0.508, 0.52, 0.528, 0.537, 0.545, 0.552, 0.559, 0.565, 0.569, 0.573, 0.577, 0.58, 0.583, 0.586, 0.588, 0.59, 0.591, 0.592, 0.594, 0.594, 0.595, 0.595, 0.596];
let FEG60 = [0.284, 0.299, 0.316, 0.335, 0.352, 0.369, 0.383, 0.397, 0.41, 0.423, 0.436, 0.447, 0.459, 0.47, 0.48, 0.491, 0.499, 0.507, 0.515, 0.521, 0.528, 0.533, 0.538, 0.541, 0.545, 0.548, 0.55, 0.553, 0.555, 0.557, 0.558, 0.559, 0.56, 0.561, 0.562, 0.562, 0.562];
let FEG56 = [0.268, 0.282, 0.298, 0.316, 0.333, 0.348, 0.362, 0.375, 0.387, 0.4, 0.411, 0.422, 0.433, 0.444, 0.453, 0.464, 0.471, 0.479, 0.486, 0.492, 0.498, 0.503, 0.507, 0.511, 0.514, 0.517, 0.519, 0.522, 0.524, 0.525, 0.527, 0.528, 0.529, 0.53, 0.53, 0.531, 0.531];
let FEG53 = [0.253, 0.267, 0.281, 0.298, 0.314, 0.329, 0.342, 0.354, 0.365, 0.377, 0.388, 0.398, 0.409, 0.419, 0.428, 0.438, 0.444, 0.452, 0.459, 0.464, 0.47, 0.475, 0.479, 0.482, 0.485, 0.488, 0.49, 0.493, 0.494, 0.496, 0.497, 0.498, 0.499, 0.5, 0.501, 0.501, 0.501];
let FEG50 = [0.239, 0.252, 0.266, 0.282, 0.297, 0.31, 0.323, 0.334, 0.345, 0.356, 0.367, 0.376, 0.386, 0.395, 0.404, 0.413, 0.42, 0.427, 0.433, 0.438, 0.444, 0.448, 0.452, 0.455, 0.458, 0.461, 0.463, 0.465, 0.467, 0.468, 0.47, 0.47, 0.471, 0.472, 0.473, 0.473, 0.473];
let fan_bare_shaft_efficiencies = {'FEG90': FEG90, 'FEG85': FEG85, 'FEG80': FEG80, 'FEG75': FEG75, 'FEG71': FEG71, 'FEG67': FEG67, 'FEG63': FEG63, 'FEG60': FEG60, 'FEG56': FEG56, 'FEG53': FEG53, 'FEG50': FEG50};
/*for key, values in fan_bare_shaft_efficiencies.items():
    plt.plot(fan_diameters, values, label=key)
plt.legend()
plt.show()*/
let FMEG_axial_powers = [125.0, 300.0, 1000.0, 2500.0, 5000.0, 8000.0, 10000.0, 20000.0, 60000.0, 160000.0, 300000.0, 375000.0, 500000.0];
let FMEG27 = [0.15, 0.174, 0.207, 0.232, 0.251, 0.264, 0.27, 0.275, 0.283, 0.291, 0.296, 0.297, 0.3];
let FMEG31 = [0.19, 0.214, 0.247, 0.272, 0.291, 0.304, 0.31, 0.315, 0.323, 0.331, 0.336, 0.337, 0.34];
let FMEG35 = [0.23, 0.254, 0.287, 0.312, 0.331, 0.344, 0.35, 0.355, 0.363, 0.371, 0.376, 0.377, 0.38];
let FMEG39 = [0.27, 0.294, 0.327, 0.352, 0.371, 0.384, 0.39, 0.395, 0.403, 0.411, 0.416, 0.417, 0.42];
let FMEG42 = [0.3, 0.324, 0.357, 0.382, 0.401, 0.414, 0.42, 0.425, 0.433, 0.441, 0.446, 0.447, 0.45];
let FMEG46 = [0.34, 0.364, 0.397, 0.422, 0.441, 0.454, 0.46, 0.465, 0.473, 0.481, 0.486, 0.487, 0.49];
let FMEG50 = [0.38, 0.404, 0.437, 0.462, 0.481, 0.494, 0.5, 0.505, 0.513, 0.521, 0.526, 0.527, 0.53];
let FMEG53 = [0.41, 0.434, 0.467, 0.492, 0.511, 0.524, 0.53, 0.535, 0.543, 0.551, 0.556, 0.557, 0.56];
let FMEG55 = [0.43, 0.454, 0.487, 0.512, 0.531, 0.544, 0.55, 0.555, 0.563, 0.571, 0.576, 0.577, 0.58];
let FMEG58 = [0.46, 0.484, 0.517, 0.542, 0.561, 0.574, 0.58, 0.585, 0.593, 0.601, 0.606, 0.607, 0.61];
let FMEG60 = [0.48, 0.504, 0.537, 0.562, 0.581, 0.594, 0.6, 0.605, 0.613, 0.621, 0.626, 0.627, 0.63];
let FMEG62 = [0.5, 0.524, 0.557, 0.582, 0.601, 0.614, 0.62, 0.625, 0.633, 0.641, 0.646, 0.647, 0.65];
let FMEG64 = [0.52, 0.544, 0.577, 0.602, 0.621, 0.634, 0.64, 0.645, 0.653, 0.661, 0.666, 0.667, 0.67];
let FMEG66 = [0.54, 0.564, 0.597, 0.622, 0.641, 0.654, 0.66, 0.665, 0.673, 0.681, 0.686, 0.687, 0.69];
let fan_driven_axial_efficiencies = {'FMEG27': FMEG27, 'FMEG31': FMEG31, 'FMEG35': FMEG35, 'FMEG39': FMEG39, 'FMEG42': FMEG42, 'FMEG46': FMEG46, 'FMEG50': FMEG50, 'FMEG53': FMEG53, 'FMEG55': FMEG55, 'FMEG58': FMEG58, 'FMEG60': FMEG60, 'FMEG62': FMEG62, 'FMEG64': FMEG64, 'FMEG66': FMEG66};
let FMEG_centrifugal_backward_powers = FMEG_axial_powers;
// TODO: figure out why there are duplicates here
FMEG35 = [0.15, 0.19, 0.245, 0.287, 0.318, 0.34, 0.35, 0.357, 0.369, 0.38, 0.387, 0.389, 0.392];
FMEG39 = [0.19, 0.23, 0.285, 0.327, 0.358, 0.38, 0.39, 0.397, 0.409, 0.42, 0.427, 0.429, 0.432];
FMEG42 = [0.22, 0.26, 0.315, 0.357, 0.388, 0.41, 0.42, 0.427, 0.439, 0.45, 0.457, 0.459, 0.462];
FMEG46 = [0.26, 0.3, 0.355, 0.397, 0.428, 0.45, 0.46, 0.467, 0.479, 0.49, 0.497, 0.499, 0.502];
FMEG50 = [0.3, 0.34, 0.395, 0.437, 0.468, 0.49, 0.5, 0.507, 0.519, 0.53, 0.537, 0.539, 0.542];
FMEG53 = [0.33, 0.37, 0.425, 0.467, 0.498, 0.52, 0.53, 0.537, 0.549, 0.56, 0.567, 0.569, 0.572];
FMEG55 = [0.35, 0.39, 0.445, 0.487, 0.518, 0.54, 0.55, 0.557, 0.569, 0.58, 0.587, 0.589, 0.592];
FMEG58 = [0.38, 0.42, 0.475, 0.517, 0.548, 0.57, 0.58, 0.587, 0.599, 0.61, 0.617, 0.619, 0.622];
FMEG60 = [0.4, 0.44, 0.495, 0.537, 0.568, 0.59, 0.6, 0.607, 0.619, 0.63, 0.637, 0.639, 0.642];
FMEG62 = [0.42, 0.46, 0.515, 0.557, 0.588, 0.61, 0.62, 0.627, 0.639, 0.65, 0.657, 0.659, 0.662];
FMEG64 = [0.44, 0.48, 0.535, 0.577, 0.608, 0.63, 0.64, 0.647, 0.659, 0.67, 0.677, 0.679, 0.682];
FMEG66 = [0.46, 0.5, 0.555, 0.597, 0.628, 0.65, 0.66, 0.667, 0.679, 0.69, 0.697, 0.699, 0.702];
let FMEG68 = [0.48, 0.52, 0.575, 0.617, 0.648, 0.67, 0.68, 0.687, 0.699, 0.71, 0.717, 0.719, 0.722];
let FMEG70 = [0.5, 0.54, 0.595, 0.637, 0.668, 0.69, 0.7, 0.707, 0.719, 0.73, 0.737, 0.739, 0.742];
let FMEG72 = [0.52, 0.56, 0.615, 0.657, 0.688, 0.71, 0.72, 0.727, 0.739, 0.75, 0.757, 0.759, 0.762];
let FMEG74 = [0.54, 0.58, 0.635, 0.677, 0.708, 0.73, 0.74, 0.747, 0.759, 0.77, 0.777, 0.779, 0.782];
let FMEG76 = [0.56, 0.6, 0.655, 0.697, 0.728, 0.75, 0.76, 0.767, 0.779, 0.79, 0.797, 0.799, 0.802];
let fan_centrifugal_backward_efficiencies = {'FMEG35': FMEG35, 'FMEG39': FMEG39, 'FMEG42': FMEG42, 'FMEG46': FMEG46, 'FMEG50': FMEG50, 'FMEG53': FMEG53, 'FMEG55': FMEG55, 'FMEG58': FMEG58, 'FMEG60': FMEG60, 'FMEG62': FMEG62, 'FMEG64': FMEG64, 'FMEG66': FMEG66, 'FMEG68': FMEG68, 'FMEG70': FMEG70, 'FMEG72': FMEG72, 'FMEG74': FMEG74, 'FMEG76': FMEG76};
let FMEG_cross_flow_powers = [130.0, 300.0, 500.0, 800.0, 1000.0, 2000.0, 3000.0, 4000.0, 5000.0, 8000.0, 10000.0, 16000.0, 22000.0];
let FMEG08 = [0.03, 0.04, 0.046, 0.051, 0.054, 0.062, 0.067, 0.07, 0.072, 0.078, 0.08, 0.08, 0.08];
let FMEG11 = [0.06, 0.07, 0.076, 0.081, 0.084, 0.092, 0.097, 0.1, 0.102, 0.108, 0.11, 0.11, 0.11];
let FMEG14 = [0.09, 0.1, 0.106, 0.111, 0.114, 0.122, 0.127, 0.13, 0.132, 0.138, 0.14, 0.14, 0.14];
let FMEG19 = [0.14, 0.15, 0.156, 0.161, 0.164, 0.172, 0.177, 0.18, 0.182, 0.188, 0.19, 0.19, 0.19];
let FMEG23 = [0.18, 0.19, 0.196, 0.201, 0.204, 0.212, 0.217, 0.22, 0.222, 0.228, 0.23, 0.23, 0.23];
let FMEG28 = [0.23, 0.24, 0.246, 0.251, 0.254, 0.262, 0.267, 0.27, 0.272, 0.278, 0.28, 0.28, 0.28];
let FMEG32 = [0.27, 0.28, 0.286, 0.291, 0.294, 0.302, 0.307, 0.31, 0.312, 0.318, 0.32, 0.32, 0.32];
let fan_crossflow_efficiencies = {'FMEG08': FMEG08, 'FMEG11': FMEG11, 'FMEG14': FMEG14, 'FMEG19': FMEG19, 'FMEG23': FMEG23, 'FMEG28': FMEG28, 'FMEG32': FMEG32};
