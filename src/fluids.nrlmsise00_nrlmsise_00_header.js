let __all__ = ['nrlmsise_flags', 'ap_array', 'nrlmsise_input', 'nrlmsise_output'];
export class nrlmsise_flags {
    constructor() {
        this.switches = Array(24).fill(0);
        this.sw = Array(24).fill(0);
        this.swc = Array(24).fill(0);
    }
}
export class ap_array {
    constructor() {
        this.a = Array(7).fill(0);
    }
}
export class nrlmsise_input {
    constructor( year=0, doy=0, sec=0.0, alt=0.0, g_lat=0.0, g_long=0.0,
                 lst=0.0, f107A=0.0, f107=0.0, ap=0.0, ap_a=null) {
        this.year = year; ///* year, currently ignored */
        this.doy = doy; ///* day of year */
        this.sec = sec; ///* seconds in day (UT) */
        this.alt = alt; ///* altitude in kilometes */
        this.g_lat = g_lat; ///* geodetic latitude */
        this.g_long = g_long; ///* geodetic longitude */
        this.lst = lst; ///* local apparent solar time (hours), see note above */
        this.f107A = f107A; ///* 81 day average of F10.7 flux (centered on doy) */
        this.f107 = f107; ///* daily F10.7 flux for previous day */
        this.ap = ap; ///* magnetic index(daily) */
        this.ap_a = ap_a; ///* see above */ Set as none for an idiot check
    }
}
export class nrlmsise_output {
    constructor() {
        this.d = Array(9).fill(0); ///* densities */
        this.t = Array(2).fill(0); ///* temperatures */
    }
}
