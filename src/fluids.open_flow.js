import { g } from './fluids.constants.js';
import { interp } from './fluids.numerics_init.js';
import { radians } from './fluids.helpers.js';
let __all__ = ['Q_weir_V_Shen', 'Q_weir_rectangular_Kindsvater_Carter', 'Q_weir_rectangular_SIA', 'Q_weir_rectangular_full_Ackers', 'Q_weir_rectangular_full_SIA', 'Q_weir_rectangular_full_Rehbock', 'Q_weir_rectangular_full_Kindsvater_Carter', 'V_Manning', 'n_Manning_to_C_Chezy', 'C_Chezy_to_n_Manning', 'V_Chezy', 'n_natural', 'n_excavated_dredged', 'n_lined_built', 'n_closed_conduit', 'n_dicts'];
let nape_types = ['free', 'depressed', 'clinging'];
let flow_types = ['aerated', 'partially aerated', 'unaerated'];
let weir_types = ['V-notch', 'rectangular', 'rectangular full-channel', 'Cipoletti', 'broad-crested', 'Ogee'];
let angles_Shen = [20, 40, 60, 80, 100];
let Cs_Shen = [0.59, 0.58, 0.575, 0.575, 0.58];
let k_Shen = [0.0028, 0.0017, 0.0012, 0.001, 0.001];
export function Q_weir_V_Shen({h1, angle=90}) {
    let C = interp(angle, angles_Shen, Cs_Shen);
    let k = interp(angle, angles_Shen, k_Shen);
    return C*Math.tan(radians(angle)/2)*Math.sqrt(g)*(h1 + k)**2.5;
}
////// Rectangular Weirs
export function Q_weir_rectangular_Kindsvater_Carter({h1, h2, b}) {
    return 0.554*(1 - 0.0035*h1/h2)*(b + 0.0025)*Math.sqrt(g)*(h1 + 0.0001)**1.5;
}
export function Q_weir_rectangular_SIA({h1, h2, b, b1}) {
    let h = h1 + h2;
    let Q = 0.544*(1 + 0.064*(b/b1)**2 + (0.00626 - 0.00519*(b/b1)**2)/(h1 + 0.0016))*(1 + 0.5*(b/b1)**4*(h1/(h1 + h2))**2)*b*Math.sqrt(g)*h**1.5;
    return Q;
}
////// Rectangular Weirs, full channel
export function Q_weir_rectangular_full_Ackers({h1, h2, b}) {
    return 0.564*(1 + 0.150*h1/h2)*b*Math.sqrt(g)*(h1 + 0.001)**1.5;
}
export function Q_weir_rectangular_full_SIA({h1, h2, b}) {
    let Q = 2/3.*Math.sqrt(2)*(0.615 + 0.000615/(h1 + 0.0016))*b*Math.sqrt(g)*h1 + 0.5*(h1/(h1+h2))**2*b*Math.sqrt(g)*h1**1.5;
    return Q;
}
export function Q_weir_rectangular_full_Rehbock({h1, h2, b}) {
    return 2/3.*Math.sqrt(2)*(0.602 + 0.0832*h1/h2)*b*Math.sqrt(g)*(h1+0.00125)**1.5;
}
//print [Q_weir_rectangular_full_Rehbock(h1=0.3, h2=0.4, b=2)]
export function Q_weir_rectangular_full_Kindsvater_Carter({h1, h2, b}) {
    let Q = 2/3.*Math.sqrt(2)*(0.602 + 0.075*h1/h2)*(b - 0.001)*Math.sqrt(g)*(h1 + 0.001)**1.5;
    return Q;
}
//print [Q_weir_rectangular_full_Kindsvater_Carter(h1=0.3, h2=0.4, b=2)]
////// Open flow calculations - Manning and Chezy
export function V_Manning({Rh, S, n}) {
    return Rh**(2.0/3.)*Math.sqrt(S)/n;
}
export function n_Manning_to_C_Chezy({n, Rh}) {
    return 1./n*Rh**(1/6.);
}
export function C_Chezy_to_n_Manning({C, Rh}) {
    return Rh**(1/6.)/C;
}
export function V_Chezy({Rh, S, C}) {
    return C*Math.sqrt(S*Rh);
}
////// Manning coefficients
// Tuple of minimum, average, maximum
export let n_closed_conduit = {
    'Brass': {
        'Smooth': (0.009, 0.01, 0.013),
    },
    'Steel': {
        'Lockbar and welded': (0.01, 0.012, 0.014),
        'Riveted and spiral': (0.013, 0.016, 0.017),
    },
    'Cast Iron': {
        'Coated ': (0.01, 0.013, 0.014),
        'Uncoated': (0.011, 0.014, 0.016),
    },
    'Wrought Iron': {
        'Black ': (0.012, 0.014, 0.015),
        'Galvanized': (0.013, 0.016, 0.017),
    },
    'Corrugated metal': {
        'Subdrain': (0.017, 0.019, 0.021),
        'Storm drain': (0.021, 0.024, 0.03),
    },
    'Acrylic': {
        'Smooth': (0.008, 0.009, 0.01),
    },
    'Glass': {
        'Smooth': (0.009, 0.01, 0.013),
    },
    'Cement': {
        'Neat, surface': (0.01, 0.011, 0.013),
        'Mortar': (0.011, 0.013, 0.015),
    },
    'Concrete': {
        'Culvert, straight and free of debris': (0.01, 0.011, 0.013),
        'Culvert, some bends, connections, and debris': (0.011, 0.013, 0.014),
        'Finished': (0.011, 0.012, 0.014),
        'Sewer with manholes, inlet, straight': (0.013, 0.015, 0.017),
        'Unfinished, steel form': (0.012, 0.013, 0.014),
        'Unfinished, smooth wood form': (0.012, 0.014, 0.016),
        'Unfinished, rough wood form': (0.015, 0.017, 0.02),
    },
    'Wood': {
        'Stave': (0.01, 0.012, 0.014),
        'Laminated, treated': (0.015, 0.017, 0.02),
    },
    'Clay': {
        'Common drainage tile': (0.011, 0.013, 0.017),
        'Vitrified sewer': (0.011, 0.014, 0.017),
        'Vitrified sewer with manholes, inlet, etc.': (0.013, 0.015, 0.017),
        'Vitrified Subdrain with open joint': (0.014, 0.016, 0.018),
    },
    'Brickwork': {
        'Glazed': (0.011, 0.013, 0.015),
        'Lined with cement mortar': (0.012, 0.015, 0.017),
    },
    'Other': {
        'Sanitary sewers coated with sewage slime with bends and connections': (0.012, 0.013, 0.016),
        'Paved invert, sewer, smooth bottom': (0.016, 0.019, 0.02),
        'Rubble masonry, cemented': (0.018, 0.025, 0.03),
    }
};
export let n_lined_built = {
    'Metal': {
        'Smooth steel, unpainted': (0.011, 0.012, 0.014),
        'Smooth steel, painted': (0.012, 0.013, 0.017),
        'Corrugated': (0.021, 0.025, 0.03),
    },
    'Cement': {
        'Neat, surface': (0.01, 0.011, 0.013),
        'Mortar': (0.011, 0.013, 0.015),
    },
    'Wood': {
        'Planed, untreated': (0.01, 0.012, 0.014),
        'Planed, creosoted': (0.011, 0.012, 0.015),
        'Unplaned': (0.011, 0.013, 0.015),
        'Plank with battens': (0.012, 0.015, 0.018),
        'Lined with Roofing paper': (0.01, 0.014, 0.017),
    },
    'Concrete': {
        'Trowel finish': (0.011, 0.013, 0.015),
        'Float finish': (0.013, 0.015, 0.016),
        'Finished, with gravel on bottom': (0.015, 0.017, 0.02),
        'Unfinished': (0.014, 0.017, 0.02),
        'Gunite, good section': (0.016, 0.019, 0.023),
        'Gunite, wavy section': (0.018, 0.022, 0.025),
        'On good excavated rock': (0.017, 0.02, 0.02),
        'On irregular excavated rock': (0.022, 0.027, 0.027),
    },
    'Concrete bottom float': {
        'Finished with sides of dressed stone in mortar': (0.015, 0.017, 0.02),
        'Finished with sides of random stone in mortar': (0.017, 0.02, 0.024),
        'Finished with sides of cement rubble masonry, plastered': (0.016, 0.02, 0.024),
        'Finished with sides of cement rubble masonry': (0.02, 0.025, 0.03),
        'Finished with sides of dry rubble or riprap': (0.02, 0.03, 0.035),
    },
    'Gravel bottom': {
        'Sides of formed concrete': (0.017, 0.02, 0.025),
        'Sides of random stone in mortar': (0.02, 0.023, 0.026),
        'Sides of dry rubble or riprap': (0.023, 0.033, 0.036),
    },
    'Brick': {
        'Glazed': (0.011, 0.013, 0.015),
        'In-cement mortar': (0.012, 0.015, 0.018),
    },
    'Masonry': {
        'Cemented rubble': (0.017, 0.025, 0.03),
        'Dry rubble': (0.023, 0.032, 0.035),
    },
    'Dressed ashlar': {
        'Stone paving': (0.013, 0.015, 0.017),
    },
    'Asphalt': {
        'Smooth': (0.013, 0.013, 0.013),
        'Rough': (0.016, 0.016, 0.016),
    },
    'Vegatal': {
        'Lined': (0.03, 0.4, 0.5),
    }
};
export let n_excavated_dredged = {
    'Earth, straight, and uniform': {
        'Clean, recently completed': (0.016, 0.018, 0.02),
        'Clean, after weathering': (0.018, 0.022, 0.025),
        'Gravel, uniform section, clean': (0.022, 0.025, 0.03),
        'With short grass and few weeds': (0.022, 0.027, 0.033),
    },
    'Earth, winding and sluggish': {
        'No vegetation': (0.023, 0.025, 0.03),
        'Grass and some weeds': (0.025, 0.03, 0.033),
        'Dense weeds or aquatic plants, in deep channels': (0.03, 0.035, 0.04),
        'Earth bottom; rubble sides': (0.028, 0.03, 0.035),
        'Stony bottom; weedy banks': (0.025, 0.035, 0.04),
        'Cobble bottom; clean sides': (0.03, 0.04, 0.05),
    },
    'Dragline-excavated or dredged': {
        'No vegetation': (0.025, 0.028, 0.033),
        'Light brush on banks': (0.035, 0.05, 0.06),
    },
    'Rock cuts': {
        'Smooth and Uniform': (0.025, 0.035, 0.04),
        'Jaged and Irregular': (0.035, 0.04, 0.05),
    },
    'Channels not maintained, with weeds and uncut brush': {
        'Dense weeds, as high as the flow depth': (0.05, 0.08, 0.12),
        'Clean bottom, brush on sides': (0.04, 0.05, 0.08),
        'Clean bottom, brush on sides, highest stage of flow': (0.045, 0.07, 0.11),
        'Dense brush, high stage': (0.08, 0.1, 0.14),
    }
};
export let n_natural = {
    'Major streams': {
        'Irregular, rough': (0.035, 0.07, 0.1),
    },
    'Flood plains': {
        'Pasture, no brush, short grass': (0.025, 0.03, 0.035),
        'Pasture, no brush, high grass': (0.03, 0.035, 0.05),
        'Cultivated areas, no crop': (0.02, 0.03, 0.04),
        'Cultivated areas, mature row crops': (0.025, 0.035, 0.045),
        'Cultivated areas, mature field crops': (0.03, 0.04, 0.05),
        'Brush, scattered brush, heavy weeds': (0.035, 0.05, 0.07),
        'Brush, light brush and trees, in winter': (0.035, 0.05, 0.06),
        'Brush, light brush and trees, in summer': (0.04, 0.06, 0.08),
        'Brush, medium to dense brush, in winter': (0.045, 0.07, 0.11),
        'Brush, medium to dense brush, in summer': (0.07, 0.1, 0.16),
        'Trees, dense willows, summer, straight': (0.11, 0.15, 0.2),
        'Trees, cleared land with tree stumps, no sprouts': (0.03, 0.04, 0.05),
        'Trees, cleared land with tree stumps, heavy growth of sprouts': (0.05, 0.06, 0.08),
        'Trees, heavy stand of timber, a few down trees, little undergrowth, flood stage below branches': (0.08, 0.1, 0.12),
        'Trees, heavy stand of timber, a few down trees, little undergrowth, flood stage reaching branches': (0.1, 0.12, 0.16),
    },
    'Minor streams': {
        'Mountain streams, no vegetation in channel, banks steep, trees and bush on the banks submerged to high stages, with gravel, cobbles and few boulders on bottom': (0.03, 0.04, 0.05),
        'Mountain streams, no vegetation in channel, banks steep, trees and bush on the banks submerged to high stages, with cobbles and large boulders on bottom': (0.04, 0.05, 0.07),
        'Plain streams, clean, straight, full stage, no rifts or deep pools': (0.025, 0.03, 0.033),
        'Plain streams, clean, straight, full stage, no rifts or deep pools, more stones and weeds': (0.03, 0.035, 0.04),
        'Clean, winding, some pools and shoals': (0.033, 0.04, 0.045),
        'Clean, winding, some pools and shoals, some weeds and stones': (0.035, 0.045, 0.05),
        'Clean, winding, some pools and shoals, some weeds and stones, lower stages, less effective slopes and sections': (0.04, 0.048, 0.055),
        'Clean, winding, some pools and shoals, more weeds and stones': (0.045, 0.05, 0.06),
        'Sluggish reaches, weedy, deep pools': (0.05, 0.07, 0.08),
        'Very weedy reaches, deep pools, or floodways with heavy stand of timber and underbrush': (0.075, 0.1, 0.15),
    }
};
export let n_dicts = [n_natural, n_excavated_dredged, n_lined_built, n_closed_conduit];
// TODO lookup function to determine the nearest hit based on string matching
