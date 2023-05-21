import { degrees, radians } from './fluids.helpers.js';
let nan = Number("NaN");
export function aoi_projection({surface_tilt, surface_azimuth, solar_zenith, solar_azimuth}) {
    let projection = (
        Math.cos(radians(surface_tilt)) * Math.cos(radians(solar_zenith)) +
        Math.sin(radians(surface_tilt)) * Math.sin(radians(solar_zenith)) *
        Math.cos(radians(solar_azimuth - surface_azimuth)));
    return projection;
}
export function aoi({surface_tilt, surface_azimuth, solar_zenith, solar_azimuth}) {
    let projection = aoi_projection(surface_tilt, surface_azimuth,
                                solar_zenith, solar_azimuth);
    let aoi_value = degrees(Math.acos(projection));
    return aoi_value;
}
export function poa_components({aoi, dni, poa_sky_diffuse, poa_ground_diffuse}) {
    let poa_direct = Math.max(dni * Math.cos(radians(aoi)), 0.0);
    if( poa_sky_diffuse !== null ) {
        let poa_diffuse = poa_sky_diffuse + poa_ground_diffuse;
    } else {
        poa_diffuse = poa_ground_diffuse;
    }
    let poa_global = poa_direct + poa_diffuse;
    let irrads = {};
    irrads['poa_global'] = poa_global;
    irrads['poa_direct'] = poa_direct;
    irrads['poa_diffuse'] = poa_diffuse;
    irrads['poa_sky_diffuse'] = poa_sky_diffuse;
    irrads['poa_ground_diffuse'] = poa_ground_diffuse;
    return irrads;
}
export function get_ground_diffuse({surface_tilt, ghi, albedo=.25, surface_type=null}) {
    let diffuse_irrad = ghi*albedo*(1.0 - Math.cos(radians(surface_tilt)))*0.5;
    return diffuse_irrad;
}
export function get_sky_diffuse({surface_tilt, surface_azimuth,
                    solar_zenith, solar_azimuth,
                    dni, ghi, dhi, dni_extra=null, airmass=null,
                    model='isotropic',
                    model_perez='allsitescomposite1990'}) {
    if( model === 'isotropic' ) {
        return isotropic(surface_tilt, dhi);
    } else {
        const { get_sky_diffuse } = require( './pvlib' );
        return get_sky_diffuse(surface_tilt, surface_azimuth,
                    solar_zenith, solar_azimuth,
                    dni, ghi, dhi, { dni_extra: dni_extra, airmass: airmass,
                    model: model,
                    model_perez: model_perez });
    }
}
export function get_absolute_airmass({airmass_relative, pressure=101325.}) {
    let airmass_absolute = airmass_relative*pressure/101325.;
    return airmass_absolute;
}
export function get_relative_airmass({zenith, model='kastenyoung1989'}) {
    let z = zenith;
    let zenith_rad = radians(z);
    if( 'kastenyoung1989' === model ) {
        try {
            let am = (1.0 / (Math.cos(zenith_rad) +
                  0.50572*(((6.07995 + (90.0 - z))**-1.6364))));
        } catch( e ) {
            am = nan;
        }
        if( _pyjs.isInstance(am, complex) ) {
            am = nan;
        }
    } else {
        throw new Error( 'ValueError','%s is not a valid model for relativeairmass', model );
    }
    return am;
}
export function get_total_irradiance({surface_tilt, surface_azimuth, solar_zenith, solar_azimuth, dni, ghi, dhi, dni_extra=null, airmass=null, albedo=.25, surface_type=null, model='isotropic', model_perez='allsitescomposite1990', ...kwargs}) {
    let poa_sky_diffuse = get_sky_diffuse(
        surface_tilt, surface_azimuth, solar_zenith, solar_azimuth,
        dni, ghi, dhi, { dni_extra: dni_extra, airmass: airmass, model: model,
        model_perez: model_perez });
    let poa_ground_diffuse = get_ground_diffuse(surface_tilt, ghi, albedo,
                                            surface_type);
    let aoi_ = aoi(surface_tilt, surface_azimuth, solar_zenith, solar_azimuth);
    let irrads = poa_components(aoi_, dni, poa_sky_diffuse, poa_ground_diffuse);
    return irrads;
}
export function isotropic({surface_tilt, dhi}) {
    let sky_diffuse = dhi * (1 + Math.cos(radians(surface_tilt))) * 0.5;
    return sky_diffuse;
}
export function ineichen({apparent_zenith, airmass_absolute, linke_turbidity,
             altitude=0, dni_extra=1364., perez_enhancement=false}) {
    if( isNaN(airmass_absolute) || isNaN(apparent_zenith) ) {
        return {'ghi': 0.0, 'dni': 0.0, 'dhi': 0.0};
    }
    let cos_zenith = Math.cos(radians(apparent_zenith));
    if( cos_zenith < 0.0 ) {
        cos_zenith = 0.0;
    }
    let tl = linke_turbidity;
    let fh1 = Math.exp(-altitude/8000.);
    let fh2 = Math.exp(-altitude/1250.);
    let cg1 = 5.09e-5*altitude + 0.868;
    let cg2 = 3.92e-5*altitude + 0.0387;
    let ghi = Math.exp(-cg2*airmass_absolute*(fh1 + fh2*(tl - 1.0)));
    // https://github.com/pvlib/pvlib-python/issues/435
    if( perez_enhancement ) {
        ghi *= Math.exp(0.01*airmass_absolute**1.8);
    }
    if( ghi > 0.0 ) {
        ghi = cg1 * dni_extra * cos_zenith * tl / tl * ghi;
    } else {
        ghi = 0.0;
    }
    // BncI = "normal beam clear sky radiation"
    let b = 0.664 + 0.163/fh1;
    let bnci = b * Math.exp(-0.09 * airmass_absolute * (tl - 1));
    if( bnci > 0.0 ) {
        bnci = dni_extra * bnci;
    } else {
        bnci = 0.0;
    }
    // "empirical correction" SE 73, 157 & SE 73, 312.
    try {
        let bnci_2 = ((1.0 - (0.1 - 0.2*Math.exp(-tl))/(0.1 + 0.882/fh1)) /
                  cos_zenith);
    } catch( e ) {
        bnci_2 = 1e20;
    }
    let multiplier = (bnci_2 > 0.0 ? bnci_2 : bnci_2);
    multiplier = multiplier > 1e20? 1e20 : multiplier;
    bnci_2 = ghi*multiplier;
    let dni = bnci < bnci_2? bnci : bnci_2;
    let dhi = ghi - dni*cos_zenith;
    return {'ghi': ghi, 'dni': dni, 'dhi': dhi};
}
