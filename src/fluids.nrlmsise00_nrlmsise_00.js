import * as nrlmsis_header from './fluids.nrlmsise00_nrlmsise_00_header.js';
import * as nrlmsis_data from './fluids.nrlmsise00_nrlmsise_00_data.js';
let __all__ = ['gtd7'];
//
let gsurf = [0.0];
let re_nrlmsise_00 = [0.0];
let dd = 0.0;
let dm04 = 0.0;
let dm16 = 0.0;
let dm28 = 0.0;
let dm32 = 0.0;
let dm40 = 0.0;
let dm01 = 0.0;
let dm14 = 0.0;
let meso_tn1 = [0.0]*5;
let meso_tn2 = [0.0]*4;
let meso_tn3 = [0.0]*5;
let meso_tgn1 = [0.0, 0.0];
let meso_tgn2 = [0.0, 0.0];
let meso_tgn3 = [0.0, 0.0];
//
//
//Dont to need to do anyt of the externs, they are all here
//
let dfa = 0.0;
let plg = [...Array(4)].map(e => Array(9).fill(0));
let ctloc = 0.0;
let stloc = 0.0;
let c2tloc = 0.0;
let s2tloc = 0.0;
let s3tloc = 0.0;
let c3tloc = 0.0;
let apdf = 0.0;
let apt = [0.0]*4;
//since rgas is used eerywehre usignthe same variable, ill make it glboal
//rgas = 831.44621
//rgas = 831.4
export function tselec(flags) {
    for( let i; i<24; i++ ) {
        if((i !== 9) ) {
            if((flags.switches[i]===1) ) {
                flags.sw[i]=1;
            } else {
                flags.sw[i]=0;
            }
            if((flags.switches[i]>0) ) {
                flags.swc[i]=1;
            } else {
                flags.swc[i]=0;
            }
        } else {
            flags.sw[i]=flags.switches[i];
            flags.swc[i]=flags.switches[i];
        }
    }
    return;
}
export function glatf({lat, gv, reff}) {
    let dgtr = 1.74533E-2;
    let c2 = Math.cos(2.0*dgtr*lat);
    //Need to return these since the c program wants pointers to these
    gv[0] = 980.616 * (1.0 - 0.0026373 * c2);
    reff[0] = 2.0 * (gv[0]) / (3.085462E-6 + 2.27E-9 * c2) * 1.0E-5; //The may-be troubled line
    return; //gv, rref
}
export function ccor({alt, r, h1, zh}) {
    let e = (alt - zh) / h1;
    if((e>70.0) ) {
        return 1.0; // exp(0) # pragma: no cover
    } else if( (e < -70.0) ) {
        return Math.exp(r);
}
    let ex = Math.exp(e);
    e = r / (1.0 + ex);
    return Math.exp(e);
}
export function ccor2({alt, r, h1, zh, h2}) {
    let e1 = (alt - zh) / h1;
    let e2 = (alt - zh) / h2;
    if( ((e1 > 70.0) || (e2 > 70)) ) { // pragma: no cover
        return 1.0; // exp(0)
    }
    if( ((e1 < -70) && (e2 < -70)) ) { // pragma: no cover
        return Math.exp(r);
    }
    let ex1 = Math.exp(e1);
    let ex2 = Math.exp(e2);
    let ccor2v = r / (1.0 + 0.5 * (ex1 + ex2));
    return Math.exp(ccor2v);
}
export function scalh({alt, xm, temp}) {
    //rgas = 831.44621    #maybe make this a global constant?
    let rgas = 831.4;
    let g = gsurf[0] / (Math.pow( (1.0 + alt/re_nrlmsise_00[0]),2.0));
    g = rgas * temp / (g * xm);
    return g;
}
export function dnet({dd, dm, zhm, xmm, xm}) {
    let a  = zhm / (xmm-xm);
    if(( !((dm>0) && (dd>0))) ) { // pragma: no cover
        if(((dd===0) && (dm===0)) ) {
            let dd=1;
        }
        if((dm===0) ) {
            return dd;
        }
        if((dd===0) ) {
            return dm;
        }
    }
    let ylog = a * Math.log(dm/dd);
    if((ylog < -10.0) ) {
        return dd;
    }
    if((ylog>10.0) ) { // pragma: no cover
        return dm;
    }
    a = dd*Math.pow((1.0 + Math.exp(ylog)),(1.0/a));
    return a;
}
export function splini({xa, ya, y2a, n, x, y}) {
    let yi = 0;
    let klo = 0;
    let khi = 1;
    while(((x>xa[klo]) && (khi<n)) ) {
        let xx = x;
        if((khi < (n-1)) ) {
            if( (x < xa[khi]) ) {
                xx = x;
            } else {
                xx = xa[khi];
            }
        }
        let h = xa[khi] - xa[klo];
        let a = (xa[khi] - xx)/h;
        let b = (xx - xa[klo])/h;
        let a2 = a*a;
        let b2 = b*b;
        yi += ((1.0 - a2) * ya[klo] / 2.0 + b2 * ya[khi] / 2.0 + ((-(1.0+a2*a2)/4.0 + a2/2.0) * y2a[klo] + (b2*b2/4.0 - b2/2.0) * y2a[khi]) * h * h / 6.0) * h;
        klo += 1;
        khi += 1;
    }
    y[0] = yi;
    return; //yi
}
export function splint({xa, ya, y2a, n, x, y}) {
    let klo = 0;
    let khi = n-1;
    while(((khi-klo)>1) ) {
        let k=int((khi+klo)/2);
        if( (xa[k]>x) ) {
            khi = k;
        } else {
            klo = k;
        }
    }
    let h = xa[khi] - xa[klo];
    let a = (xa[khi] - x)/h;
    let b = (x - xa[klo])/h;
    let yi = a * ya[klo] + b * ya[khi] + ((a*a*a - a) * y2a[klo] + (b*b*b - b) * y2a[khi]) * h * h/6.0;
    y[0] = yi; //may not need this
    return; //yi #or this
}
export function spline({x, y, n, yp1, ypn, y2}) {
    let u = [0.0]*n; //I think this is the same as malloc
    //no need for the out of memory
    if( (yp1 > 0.99E30) ) { // pragma: no cover
        y2[0] = 0;
        u[0] = 0;
    } else {
        y2[0]=-0.5;
        u[0]=(3.0/(x[1]-x[0]))*((y[1]-y[0])/(x[1]-x[0])-yp1);
    }
    for( let i of range(1, n-1) ) {
        let sig = (x[i]-x[i-1])/(x[i+1] - x[i-1]);
        let p = sig * y2[i-1] + 2.0;
        y2[i] = (sig - 1.0) / p;
        u[i] = (6.0 * ((y[i+1] - y[i])/(x[i+1] - x[i]) -(y[i] - y[i-1]) / (x[i] - x[i-1]))/(x[i+1] - x[i-1]) - sig * u[i-1])/p;
    }
    if( (ypn>0.99E30) ) { // pragma: no cover
        let qn = 0;
        let un = 0;
    } else {
        qn = 0.5;
        un = (3.0 / (x[n-1] - x[n-2])) * (ypn - (y[n-1] - y[n-2])/(x[n-1] - x[n-2]));
    }
    y2[n-1] = (un - qn * u[n-2]) / (qn * y2[n-2] + 1.0);
    //it uses a for loop here, but its not something python can do (I dont think)
    let k = n-2;
    while((k >= 0) ) {
        y2[k] = y2[k] * y2[k+1] + u[k];
        k -= 1;
    }
    //This for loop might work
    //for k in range(n-2, -1, -1):
    //    y2[k] = y2[k] * y2[k+1] + u[k]
    //no need to free u here
    return;
}
export function zeta({zz, zl}) {
    return ((zz-zl)*(re_nrlmsise_00[0]+zl)/(re_nrlmsise_00[0]+zz));    //re is the global variable
}
export function densm({alt, d0, xm, tz, mn3, zn3, tn3, tgn3, mn2, zn2, tn2, tgn2}) {
    let xs = [0.0]*10;
    let ys = [0.0]*10;
    let y2out = [0.0]*10;
    let rgas = 831.4;
    //rgas = 831.44621    #maybe make this a global constant?
    let densm_tmp=d0;
    if( (alt>zn2[0]) ) { // pragma: no cover
        if((xm===0.0) ) {
            return tz[0];
        } else {
            return d0;
        }
    //
    }
    if( (alt>zn2[mn2-1]) ) {
        let z=alt;
    } else {
        z=zn2[mn2-1];
    }
    let mn=mn2;
    let z1=zn2[0];
    let z2=zn2[mn-1];
    let t1=tn2[0];
    let t2=tn2[mn-1];
    let zg = zeta(z, z1);
    let zgdif = zeta(z2, z1);
    //
    for( let k; k<mn; k++ ) {
        xs[k]=zeta(zn2[k],z1)/zgdif;
        ys[k]=1.0 / tn2[k];
    }
    let yd1=-tgn2[0] / (t1*t1) * zgdif;
    let yd2=-tgn2[1] / (t2*t2) * zgdif * (Math.pow(((re_nrlmsise_00[0]+z2)/(re_nrlmsise_00[0]+z1)),2.0));
    //
    spline (xs, ys, mn, yd1, yd2, y2out);   //No need to change this
    let x = zg/zgdif;
    let y = [0.0];
    splint (xs, ys, y2out, mn, x, y);
    //
    tz[0] = 1.0 / y[0];
    if( (xm!==0.0) ) {
        //
        let glb = gsurf[0] / (Math.pow((1.0 + z1/re_nrlmsise_00[0]),2.0));
        let gamm = xm * glb * zgdif / rgas;
        //
        let yi = [0.0];
        splini(xs, ys, y2out, mn, x, yi);
        let expl=gamm*yi[0];
        if( (expl>50.0) ) { // pragma: no cover
            expl=50.0;
        }
        let densm_tmp = densm_tmp * (t1 / tz[0]) * Math.exp(-expl);
    }
    if( (alt>zn3[0]) ) {
        if( (xm===0.0) ) {
            return tz[0];
        } else {
            return densm_tmp;
        }
    //
    }
    z = alt;
    mn = mn3;
    z1=zn3[0];
    z2=zn3[mn-1];
    t1=tn3[0];
    t2=tn3[mn-1];
    zg=zeta(z,z1);
    zgdif=zeta(z2,z1);
    //
    for( let k; k<mn; k++ ) {
        xs[k] = zeta(zn3[k],z1) / zgdif;
        ys[k] = 1.0 / tn3[k];
    }
    yd1=-tgn3[0] / (t1*t1) * zgdif;
    yd2=-tgn3[1] / (t2*t2) * zgdif * (Math.pow(((re_nrlmsise_00[0]+z2)/(re_nrlmsise_00[0]+z1)),2.0));
    //
    spline (xs, ys, mn, yd1, yd2, y2out);
    x = zg/zgdif;
    y = [0.0];
    splint (xs, ys, y2out, mn, x, y);
    //
    tz[0] = 1.0 / y[0];
    if( (xm!==0.0) ) {
        //
        glb = gsurf[0] / (Math.pow((1.0 + z1/re_nrlmsise_00[0]),2.0));
        gamm = xm * glb * zgdif / rgas;
        //
        yi = [0.0];
        splini(xs, ys, y2out, mn, x, yi);
        expl=gamm*yi[0];
        if( (expl>50.0) ) { // pragma: no cover
            expl=50.0;
        }
        densm_tmp = densm_tmp * (t1 / tz[0]) * Math.exp(-expl);
    }
    if( (xm===0.0) ) {
        return tz[0];
    } else {
        return densm_tmp;
    }
}
export function densu({alt, dlb, tinf, tlb, xm, alpha, tz, zlb, s2, mn1, zn1, tn1, tgn1}) {
    let rgas = 831.4;
    //rgas = 831.44621    #maybe make this a global constant?
    let densu_temp = 1.0;
    let xs = [0.0]*5;
    let ys = [0.0]*5;
    let y2out = [0.0]*5;
    //
    let za=zn1[0];
    if( (alt>za) ) {
        let z=alt;
    } else {
        z=za;
    }
    //
    let zg2 = zeta(z, zlb);
    //
    let tt = tinf - (tinf - tlb) * Math.exp(-s2*zg2);
    let ta = tt;
    tz[0] = tt;
    densu_temp = tz[0];
    if( (alt<za) ) {
        ///* calculate temperature below ZA
        // * temperature gradient at ZA from Bates profile */
        let dta = (tinf - ta) * s2 * Math.pow(((re_nrlmsise_00[0]+zlb)/(re_nrlmsise_00[0]+za)),2.0);
        tgn1[0]=dta;
        tn1[0]=ta;
        if( (alt>zn1[mn1-1]) ) {
            z=alt;
        } else {
            z=zn1[mn1-1];
        }
        let mn=mn1;
        let z1=zn1[0];
        let z2=zn1[mn-1];
        let t1=tn1[0];
        let t2=tn1[mn-1];
        //
        let zg = zeta (z, z1);
        let zgdif = zeta(z2, z1);
        //
        for( let k; k<mn; k++ ) {
            xs[k] = zeta(zn1[k], z1) / zgdif;
            ys[k] = 1.0 / tn1[k];
        }
        //
        let yd1 = -tgn1[0] / (t1*t1) * zgdif;
        let yd2 = -tgn1[1] / (t2*t2) * zgdif * Math.pow(((re_nrlmsise_00[0]+z2)/(re_nrlmsise_00[0]+z1)),2.0);
        //
        spline (xs, ys, mn, yd1, yd2, y2out);
        let x = zg / zgdif;
        let y = [0.0];
        splint (xs, ys, y2out, mn, x, y);
        //
        tz[0] = 1.0 / y[0];
        densu_temp = tz[0];
    }
    if( (xm===0) ) {
        return densu_temp;
    }
    let glb = gsurf[0] / Math.pow((1.0 + zlb/re_nrlmsise_00[0]),2.0);
    let gamma = xm * glb / (s2 * rgas * tinf);
    let expl = Math.exp(-s2 * gamma * zg2);
    if( (expl>50.0) ) { // pragma: no cover
        expl=50.0;
    }
    if( (tt<=0) ) { // pragma: no cover
        expl=50.0;
    }
    let densa = dlb * Math.pow((tlb/tt),((1.0+alpha+gamma))) * expl;
    densu_temp=densa;
    if( (alt>=za) ) {
        return densu_temp;
    }
    glb = gsurf[0] / Math.pow((1.0 + z1/re_nrlmsise_00[0]),2.0);
    let gamm = xm * glb * zgdif / rgas;
    //
    let yi = [0];
    splini (xs, ys, y2out, mn, x, yi);
    expl = gamm * yi[0];
    if( (expl>50.0) ) { // pragma: no cover
        expl=50.0;
    }
    if( (tz[0]<=0) ) { // pragma: no cover
        expl=50.0;
    }
    densu_temp = densu_temp * Math.pow ((t1 / tz[0]),(1.0 + alpha)) * Math.exp(-expl);
    return densu_temp;
}
export function g0_nrlmsise00({a, p}) {
    return (a - 4.0 + (p[25] - 1.0) * (a - 4.0 + (Math.exp(-Math.sqrt(p[24]*p[24]) * (a - 4.0)) - 1.0) / Math.sqrt(p[24]*p[24])));
}
//
export function sumex(ex) {
    return (1.0 + (1.0 - Math.pow(ex,19.0)) / (1.0 - ex) * Math.pow(ex,0.5));
}
//
export function sg0({ex, p, ap}) {
    return (g0_nrlmsise00(ap[1], p) + (g0_nrlmsise00(ap[2], p)*ex + g0_nrlmsise00(ap[3], p)*ex*ex +  g0_nrlmsise00(ap[4], p)*Math.pow(ex, 3.0) + (g0_nrlmsise00(ap[5], p)*Math.pow(ex, 4.0) +  g0_nrlmsise00(ap[6], p)*Math.pow(ex, 12.0))*(1.0 - Math.pow(ex, 8.0))/(1.0 - ex)))/sumex(ex);
}
export function globe7({p, Input, flags}) {
    let t = [0]*15;  //modified this, there was a for loop that did this
    let sw9 = 1;
    let sr = 7.2722E-5;
    let dgtr = 1.74533E-2;
    let dr = 1.72142E-2;
    let hr = 0.2618;
    let tloc = Input.lst;
    //for j in range(14):
    //    t[j] = 0
    if((flags.sw[9] > 0) ) {
        sw9 = 1;
    } else if((flags.sw[9] < 0) ) { // pragma: no cover
        sw9 = -1;
}
    let xlong = Input.g_long;
    //
    let c = Math.sin(Input.g_lat * dgtr);
    let s = Math.cos(Input.g_lat * dgtr);
    let c2 = c*c;
    let c4 = c2*c2;
    let s2 = s*s;
    plg[0][1] = c;
    plg[0][2] = 0.5*(3.0*c2 -1.0);
    plg[0][3] = 0.5*(5.0*c*c2-3.0*c);
    plg[0][4] = (35.0*c4 - 30.0*c2 + 3.0)/8.0;
    plg[0][5] = (63.0*c2*c2*c - 70.0*c2*c + 15.0*c)/8.0;
    plg[0][6] = (11.0*c*plg[0][5] - 5.0*plg[0][4])/6.0;
///*      plg[0][7] = (13.0*c*plg[0][6] - 6.0*plg[0][5])/7.0; */
    plg[1][1] = s;
    plg[1][2] = 3.0*c*s;
    plg[1][3] = 1.5*(5.0*c2-1.0)*s;
    plg[1][4] = 2.5*(7.0*c2*c-3.0*c)*s;
    plg[1][5] = 1.875*(21.0*c4 - 14.0*c2 +1.0)*s;
    plg[1][6] = (11.0*c*plg[1][5]-6.0*plg[1][4])/5.0;
///*      plg[1][7] = (13.0*c*plg[1][6]-7.0*plg[1][5])/6.0; */
///*      plg[1][8] = (15.0*c*plg[1][7]-8.0*plg[1][6])/7.0; */
    plg[2][2] = 3.0*s2;
    plg[2][3] = 15.0*s2*c;
    plg[2][4] = 7.5*(7.0*c2 -1.0)*s2;
    plg[2][5] = 3.0*c*plg[2][4]-2.0*plg[2][3];
    plg[2][6] =(11.0*c*plg[2][5]-7.0*plg[2][4])/4.0;
    plg[2][7] =(13.0*c*plg[2][6]-8.0*plg[2][5])/5.0;
    plg[3][3] = 15.0*s2*s;
    plg[3][4] = 105.0*s2*s*c;
    plg[3][5] =(9.0*c*plg[3][4]-7.*plg[3][3])/2.0;
    plg[3][6] =(11.0*c*plg[3][5]-8.*plg[3][4])/3.0;
    if(( !(((flags.sw[7]===0) && (flags.sw[8]===0)) && (flags.sw[14] === 0))) ) {
        var stloc = Math.sin(hr*tloc);
        var ctloc = Math.cos(hr*tloc);
        var s2tloc = Math.sin(2.0*hr*tloc);
        var c2tloc = Math.cos(2.0*hr*tloc);
        var s3tloc = Math.sin(3.0*hr*tloc);
        var c3tloc = Math.cos(3.0*hr*tloc);
    }
    let cd32 = Math.cos(dr*(Input.doy-p[31]));
    let cd18 = Math.cos(2.0*dr*(Input.doy-p[17]));
    let cd14 = Math.cos(dr*(Input.doy-p[13]));
    let cd39 = Math.cos(2.0*dr*(Input.doy-p[38]));
    let p32=p[31];
    let p18=p[17];
    let p14=p[13];
    let p39=p[38];
    //
    let df = Input.f107 - Input.f107A;
    var dfa = Input.f107A - 150.0;
    t[0] =  p[19]*df*(1.0+p[59]*dfa) + p[20]*df*df + p[21]*dfa + p[29]*Math.pow(dfa,2.0);
    let f1 = 1.0 + (p[47]*dfa +p[19]*df+p[20]*df*df)*flags.swc[1];
    let f2 = 1.0 + (p[49]*dfa+p[19]*df+p[20]*df*df)*flags.swc[1];
    //
    t[1] = (p[1]*plg[0][2]+ p[2]*plg[0][4]+p[22]*plg[0][6]) +  (p[14]*plg[0][2])*dfa*flags.swc[1] +p[26]*plg[0][1];
    //
    t[2] = p[18]*cd32;
    //
    t[3] = (p[15]+p[16]*plg[0][2])*cd18;
    //
    t[4] =  f1*(p[9]*plg[0][1]+p[10]*plg[0][3])*cd14;
    //
    t[5] =    p[37]*plg[0][1]*cd39;
    //
    if( (flags.sw[7]) ) {
        let t71 = (p[11]*plg[1][2])*cd14*flags.swc[5];
        let t72 = (p[12]*plg[1][2])*cd14*flags.swc[5];
        t[6] = f2*((p[3]*plg[1][1] + p[4]*plg[1][3] + p[27]*plg[1][5] + t71) *  ctloc + (p[6]*plg[1][1] + p[7]*plg[1][3] + p[28]*plg[1][5] + t72)*stloc);
    }
    if( (flags.sw[8]) ) {
        let t81 = (p[23]*plg[2][3]+p[35]*plg[2][5])*cd14*flags.swc[5];
        let t82 = (p[33]*plg[2][3]+p[36]*plg[2][5])*cd14*flags.swc[5];
        t[7] = f2*((p[5]*plg[2][2]+ p[41]*plg[2][4] + t81)*c2tloc +(p[8]*plg[2][2] + p[42]*plg[2][4] + t82)*s2tloc);
    }
    if( (flags.sw[14]) ) {
        t[13] = f2 * ((p[39]*plg[3][3]+(p[93]*plg[3][4]+p[46]*plg[3][6])*cd14*flags.swc[5])* s3tloc +(p[40]*plg[3][3]+(p[94]*plg[3][4]+p[48]*plg[3][6])*cd14*flags.swc[5])* c3tloc);
    }
    if( (flags.sw[9]===-1) ) {
        let ap = Input.ap_a;
        if( (p[51]!==0) ) {
            let exp1 = Math.exp(-10800.0*Math.sqrt(p[51]*p[51])/(1.0+p[138]*(45.0-Math.sqrt(Input.g_lat*Input.g_lat))));
            if( (exp1>0.99999) ) { // pragma: no cover
                    exp1=0.99999;
            }
            if( (p[24]<1.0E-4) ) { // pragma: no cover
                    p[24]=1.0E-4;
            }
            apt[0]=sg0(exp1,p,ap.a);
            //
            if( (flags.sw[9]) ) {
                t[8] = apt[0]*(p[50]+p[96]*plg[0][2]+p[54]*plg[0][4]+ (p[125]*plg[0][1]+p[126]*plg[0][3]+p[127]*plg[0][5])*cd14*flags.swc[5]+ (p[128]*plg[1][1]+p[129]*plg[1][3]+p[130]*plg[1][5])*flags.swc[7]* Math.cos(hr*(tloc-p[131])));
            }
        }
    } else {
        let apd=Input.ap-4.0;
        let p44=p[43];
        let p45=p[44];
        if( (p44<0) ) { // pragma: no cover
            p44 = 1.0E-5;
        }
        var apdf = apd + (p45-1.0)*(apd + (Math.exp(-p44 * apd) - 1.0)/p44);
        if( (flags.sw[9]) ) {
            t[8]=apdf*(p[32]+p[45]*plg[0][2]+p[34]*plg[0][4]+ (p[100]*plg[0][1]+p[101]*plg[0][3]+p[102]*plg[0][5])*cd14*flags.swc[5]+
             (p[121]*plg[1][1]+p[122]*plg[1][3]+p[123]*plg[1][5])*flags.swc[7]*
                Math.cos(hr*(tloc-p[124])));
        }
    }
    if( ((flags.sw[10]) && (Input.g_long>-1000.0)) ) {
            //
            if( (flags.sw[11]) ) {
                    t[10] = (1.0 + p[80]*dfa*flags.swc[1])*  ((p[64]*plg[1][2]+p[65]*plg[1][4]+p[66]*plg[1][6] +p[103]*plg[1][1]+p[104]*plg[1][3]+p[105]*plg[1][5] +flags.swc[5]*(p[109]*plg[1][1]+p[110]*plg[1][3]+p[111]*plg[1][5])*cd14)*  Math.cos(dgtr*Input.g_long)  +(p[90]*plg[1][2]+p[91]*plg[1][4]+p[92]*plg[1][6] +p[106]*plg[1][1]+p[107]*plg[1][3]+p[108]*plg[1][5] +flags.swc[5]*(p[112]*plg[1][1]+p[113]*plg[1][3]+p[114]*plg[1][5])*cd14)*  Math.sin(dgtr*Input.g_long));
        }
            if( (flags.sw[12]) ) {
                    t[11]=(1.0+p[95]*plg[0][1])*(1.0+p[81]*dfa*flags.swc[1])* (1.0+p[119]*plg[0][1]*flags.swc[5]*cd14)* ((p[68]*plg[0][1]+p[69]*plg[0][3]+p[70]*plg[0][5])* Math.cos(sr*(Input.sec-p[71])));
                    t[11]+=flags.swc[11]* (p[76]*plg[2][3]+p[77]*plg[2][5]+p[78]*plg[2][7])* Math.cos(sr*(Input.sec-p[79])+2.0*dgtr*Input.g_long)*(1.0+p[137]*dfa*flags.swc[1]);
        }
            if( (flags.sw[13]) ) {
                if( (flags.sw[9]===-1) ) {
                    if( (p[51]) ) {
                            t[12]=apt[0]*flags.swc[11]*(1.+p[132]*plg[0][1])* ((p[52]*plg[1][2]+p[98]*plg[1][4]+p[67]*plg[1][6])* Math.cos(dgtr*(Input.g_long-p[97]))) +apt[0]*flags.swc[11]*flags.swc[5]* (p[133]*plg[1][1]+p[134]*plg[1][3]+p[135]*plg[1][5])* cd14*Math.cos(dgtr*(Input.g_long-p[136]))  +apt[0]*flags.swc[12]*  (p[55]*plg[0][1]+p[56]*plg[0][3]+p[57]*plg[0][5])* Math.cos(sr*(Input.sec-p[58]));
                }
            } else {
                    t[12] = apdf*flags.swc[11]*(1.0+p[120]*plg[0][1])* ((p[60]*plg[1][2]+p[61]*plg[1][4]+p[62]*plg[1][6])* Math.cos(dgtr*(Input.g_long-p[63]))) +apdf*flags.swc[11]*flags.swc[5]*  (p[115]*plg[1][1]+p[116]*plg[1][3]+p[117]*plg[1][5])*  cd14*Math.cos(dgtr*(Input.g_long-p[118]))  + apdf*flags.swc[12]*  (p[83]*plg[0][1]+p[84]*plg[0][3]+p[85]*plg[0][5])*  Math.cos(sr*(Input.sec-p[75]));
            }
    //
        }
    }
    let tinf = p[30];
    for( let i; i<14; i++ ) {
        tinf = tinf + abs(flags.sw[i+1])*t[i];
    }
    return tinf;
}
export function glob7s({p, Input, flags}) {
    let pset = 2.0;
    let t = [0.0]*14;
    let dr=1.72142E-2;
    let dgtr=1.74533E-2;
    //
    if( (p[99]===0) ) { // pragma: no cover
        p[99]=pset;
    }
    let cd32 = Math.cos(dr*(Input.doy-p[31]));
    let cd18 = Math.cos(2.0*dr*(Input.doy-p[17]));
    let cd14 = Math.cos(dr*(Input.doy-p[13]));
    let cd39 = Math.cos(2.0*dr*(Input.doy-p[38]));
    let p32=p[31];
    let p18=p[17];
    let p14=p[13];
    let p39=p[38];
    //
    t[0] = p[21]*dfa;
    //
    t[1]=p[1]*plg[0][2] + p[2]*plg[0][4] + p[22]*plg[0][6] + p[26]*plg[0][1] + p[14]*plg[0][3] + p[59]*plg[0][5];
    //
    t[2]=(p[18]+p[47]*plg[0][2]+p[29]*plg[0][4])*cd32;
    //
    t[3]=(p[15]+p[16]*plg[0][2]+p[30]*plg[0][4])*cd18;
    //
    t[4]=(p[9]*plg[0][1]+p[10]*plg[0][3]+p[20]*plg[0][5])*cd14;
    //
    t[5]=(p[37]*plg[0][1])*cd39;
    //
    if( (flags.sw[7]) ) {
        let t71 = p[11]*plg[1][2]*cd14*flags.swc[5];
        let t72 = p[12]*plg[1][2]*cd14*flags.swc[5];
        t[6] = ((p[3]*plg[1][1] + p[4]*plg[1][3] + t71) * ctloc + (p[6]*plg[1][1] + p[7]*plg[1][3] + t72) * stloc) ;
    }
    if( (flags.sw[8]) ) {
        let t81 = (p[23]*plg[2][3]+p[35]*plg[2][5])*cd14*flags.swc[5];
        let t82 = (p[33]*plg[2][3]+p[36]*plg[2][5])*cd14*flags.swc[5];
        t[7] = ((p[5]*plg[2][2] + p[41]*plg[2][4] + t81) * c2tloc + (p[8]*plg[2][2] + p[42]*plg[2][4] + t82) * s2tloc);
    }
    if( (flags.sw[14]) ) {
            t[13] = p[39] * plg[3][3] * s3tloc + p[40] * plg[3][3] * c3tloc;
    }
    if( (flags.sw[9]) ) {
        if( (flags.sw[9]===1) ) {
            t[8] = apdf * (p[32] + p[45] * plg[0][2] * flags.swc[2]);
        }
        if( (flags.sw[9]===-1) ) {
            t[8]=(p[50]*apt[0] + p[96]*plg[0][2] * apt[0]*flags.swc[2]);
        }
    }
    if( ( !((flags.sw[10]===0) || (flags.sw[11]===0) || (Input.g_long<=-1000.0))) ) {
            t[10] = (1.0 + plg[0][1]*(p[80]*flags.swc[5]*Math.cos(dr*(Input.doy-p[81])) +p[85]*flags.swc[6]*Math.cos(2.0*dr*(Input.doy-p[86]))) +p[83]*flags.swc[3]*Math.cos(dr*(Input.doy-p[84])) +p[87]*flags.swc[4]*Math.cos(2.0*dr*(Input.doy-p[88]))) *((p[64]*plg[1][2]+p[65]*plg[1][4]+p[66]*plg[1][6] +p[74]*plg[1][1]+p[75]*plg[1][3]+p[76]*plg[1][5] )*Math.cos(dgtr*Input.g_long) +(p[90]*plg[1][2]+p[91]*plg[1][4]+p[92]*plg[1][6] +p[77]*plg[1][1]+p[78]*plg[1][3]+p[79]*plg[1][5] )*Math.sin(dgtr*Input.g_long));
    }
    let tt=0;
    for( let i; i<14; i++ ) {
        tt+=abs(flags.sw[i+1])*t[i];
    }
    return tt;
}
export function gtd7({Input, flags, output}) {
    let mn3 = 5;
    let zn3 = [32.5,20.0,15.0,10.0,0.0];
    let mn2 = 4;
    let zn2 = [72.5,55.0,45.0,32.5];
    let zmix = 62.5;
    let soutput = nrlmsise_output();
    tselec(flags);
    //
    let xlat=Input.g_lat;
    if( (flags.sw[2]===0) ) { // pragma: no cover
        let xlat=45.0;
    }
    glatf(xlat, gsurf, re_nrlmsise_00);
    let xmm = pdm[2][4];
    //
    if( (Input.alt>zn2[0]) ) {
        let altt=Input.alt;
    } else {
        altt=zn2[0];
    }
    let tmp=Input.alt;
    Input.alt=altt;
    gts7(Input, flags, soutput);
    altt=Input.alt;
    Input.alt=tmp;
    if( (flags.sw[0]) ) { // pragma: no cover  #
        let dm28m= dm28*1.0E6;
    } else {
        dm28m = dm28;
    }
    output.t[0]=soutput.t[0];
    output.t[1]=soutput.t[1];
    if( (Input.alt>=zn2[0]) ) {
        for( let i; i<9; i++ ) {
            output.d[i]=soutput.d[i];
        }
        return;
    }
    meso_tgn2[0]=meso_tgn1[1];
    meso_tn2[0]=meso_tn1[4];
    meso_tn2[1]=pma[0][0]*pavgm[0]/(1.0-flags.sw[20]*glob7s(pma[0], Input, flags));
    meso_tn2[2]=pma[1][0]*pavgm[1]/(1.0-flags.sw[20]*glob7s(pma[1], Input, flags));
    meso_tn2[3]=pma[2][0]*pavgm[2]/(1.0-flags.sw[20]*flags.sw[22]*glob7s(pma[2], Input, flags));
    meso_tgn2[1]=pavgm[8]*pma[9][0]*(1.0+flags.sw[20]*flags.sw[22]*glob7s(pma[9], Input, flags))*meso_tn2[3]*meso_tn2[3]/(Math.pow((pma[2][0]*pavgm[2]),2.0));
    meso_tn3[0]=meso_tn2[3];
    if( (Input.alt<zn3[0]) ) {
/*       LOWER STRATOSPHERE AND TROPOSPHERE (below zn3[0])
         Temperature at nodes and gradients at end nodes
*/
        meso_tgn3[0]=meso_tgn2[1];
        meso_tn3[1]=pma[3][0]*pavgm[3]/(1.0-flags.sw[22]*glob7s(pma[3], Input, flags));
        meso_tn3[2]=pma[4][0]*pavgm[4]/(1.0-flags.sw[22]*glob7s(pma[4], Input, flags));
        meso_tn3[3]=pma[5][0]*pavgm[5]/(1.0-flags.sw[22]*glob7s(pma[5], Input, flags));
        meso_tn3[4]=pma[6][0]*pavgm[6]/(1.0-flags.sw[22]*glob7s(pma[6], Input, flags));
        meso_tgn3[1]=pma[7][0]*pavgm[7]*(1.0+flags.sw[22]*glob7s(pma[7], Input, flags)) *meso_tn3[4]*meso_tn3[4]/(Math.pow((pma[6][0]*pavgm[6]),2.0));
    }
    let dmc=0;
    if( (Input.alt>zmix) ) {
        dmc = 1.0 - (zn2[0]-Input.alt)/(zn2[0] - zmix);
    }
    let dz28=soutput.d[2];
    ///**** N2 density ****/
    let dmr=soutput.d[2] / dm28m - 1.0;
    let tz = [0.0];
    output.d[2]=densm(Input.alt,dm28m,xmm, tz, mn3, zn3, meso_tn3, meso_tgn3, mn2, zn2, meso_tn2, meso_tgn2);
    output.d[2]=output.d[2] * (1.0 + dmr*dmc);
    ///**** HE density ****/
    dmr = soutput.d[0] / (dz28 * pdm[0][1]) - 1.0;
    output.d[0] = output.d[2] * pdm[0][1] * (1.0 + dmr*dmc);
    ///**** O density ****/
    output.d[1] = 0;
    output.d[8] = 0;
    ///**** O2 density ****/
    dmr = soutput.d[3] / (dz28 * pdm[3][1]) - 1.0;
    output.d[3] = output.d[2] * pdm[3][1] * (1.0 + dmr*dmc);
    ///**** AR density ***/
    dmr = soutput.d[4] / (dz28 * pdm[4][1]) - 1.0;
    output.d[4] = output.d[2] * pdm[4][1] * (1.0 + dmr*dmc);
    ///**** Hydrogen density ****/
    output.d[6] = 0;
    ///**** Atomic nitrogen density ****/
    output.d[7] = 0;
    ///**** Total mass density */
    output.d[5] = 1.66E-24 * (4.0 * output.d[0] + 16.0 * output.d[1] + 28.0 * output.d[2] + 32.0 * output.d[3] + 40.0 * output.d[4] + output.d[6] + 14.0 * output.d[7]);
    if( (flags.sw[0]) ) { // pragma: no cover
        output.d[5]=output.d[5]/1000;
    }
    var dd = densm(Input.alt, 1.0, 0, tz, mn3, zn3, meso_tn3, meso_tgn3, mn2, zn2, meso_tn2, meso_tgn2);
    output.t[1]=tz[0];
    return;
}
export function gtd7d({Input, flags, output}) { // pragma: no cover
    gtd7(Input, flags, output);
    output.d[5] = 1.66E-24 * (4.0 * output.d[0] + 16.0 * output.d[1] + 28.0 * output.d[2] + 32.0 * output.d[3] + 40.0 * output.d[4] + output.d[6] + 14.0 * output.d[7] + 16.0 * output.d[8]);
    if( (flags.sw[0]) ) {
        output.d[5]=output.d[5]/1000;
    }
    return;
}
export function ghp7({Input, flags, output, press}) { // pragma: no cover
    let bm = 1.3806E-19;
    let rgas = 831.4;
    //rgas = 831.44621    #maybe make this a global constant?
    let test = 0.00043;
    let ltest = 12;
    let pl = log10(press);
    if( (pl >= -5.0) ) {
        if( (pl>2.5) ) {
            let zi = 18.06 * (3.00 - pl);
        } else if( ((pl>0.075) && (pl<=2.5)) ) {
            zi = 14.98 * (3.08 - pl);
}
 else if( ((pl>-1) && (pl<=0.075)) ) {
            zi = 17.80 * (2.72 - pl);
}
 else if( ((pl>-2) && (pl<=-1)) ) {
            zi = 14.28 * (3.64 - pl);
}
 else if( ((pl>-4) && (pl<=-2)) ) {
            zi = 12.72 * (4.32 -pl);
}
 else if( (pl<=-4) ) {
            zi = 25.3 * (0.11 - pl);
}
        let cl = Input.g_lat/90.0;
        let cl2 = cl*cl;
        if( (Input.doy<182) ) {
            let cd = (1.0 - float(Input.doy)) / 91.25;
        } else {
            cd = (float(Input.doy)) / 91.25 - 3.0;
        }
        let ca = 0;
        if( ((pl > -1.11) && (pl<=-0.23)) ) {
            ca = 1.0;
        }
        if( (pl > -0.23) ) {
            ca = (2.79 - pl) / (2.79 + 0.23);
        }
        if( ((pl <= -1.11) && (pl>-3)) ) {
            ca = (-2.93 - pl)/(-2.93 + 1.11);
        }
        let z = zi - 4.87 * cl * cd * ca - 1.64 * cl2 * ca + 0.31 * ca * cl;
    } else {
        z = 22.0 * Math.pow((pl + 4.0),2.0) + 110.0;
    }
    //
    let l = 0;
    while((true) ) {
        l += 1;
        Input.alt = z;
        gtd7(Input, flags, output);
        z = Input.alt;
        let xn = output.d[0] + output.d[1] + output.d[2] + output.d[3] + output.d[4] + output.d[6] + output.d[7];
        let p = bm * xn * output.t[1];
        if( (flags.sw[0]) ) {
            p = p*1.0E-6;
        }
        let diff = pl - log10(p);
        if( (Math.sqrt(diff*diff)<test) ) {
            return;
        }
        let xm = output.d[5] / xn / 1.66E-24;
        if( (flags.sw[0]) ) {
            xm = xm * 1.0E3;
        }
        let g = gsurf[0] / (Math.pow((1.0 + z/re_nrlmsise_00[ 0]),2.0));
        let sh = rgas * output.t[1] / (xm * g);
        //
        if( (l <  6) ) {
            z = z - sh * diff * 2.302;
        } else {
            z = z - sh * diff;
        }
    }
    return;
}
export function gts7({Input, flags, output}) {
    let zn1 = [120.0, 110.0, 100.0, 90.0, 72.5];
    let mn1 = 5;
    let dgtr=1.74533E-2;
    let dr=1.72142E-2;
    let alpha = [-0.38, 0.0, 0.0, 0.0, 0.17, 0.0, -0.38, 0.0, 0.0];
    let altl = [200.0, 300.0, 160.0, 250.0, 240.0, 450.0, 320.0, 450.0];
    let za = pdl[1][15];
    zn1[0] = za;
    for( let j; j<9; j++ ) {
        output.d[j]=0;
    }
    //
    if( (Input.alt>zn1[0]) ) {
        let tinf = ptm[0]*pt[0] *  (1.0+flags.sw[16]*globe7(pt,Input,flags));
    } else {
        tinf = ptm[0]*pt[0];
    }
    output.t[0]=tinf;
    //
    if( (Input.alt>zn1[4]) ) {
        let g0 = ptm[3]*ps[0] *  (1.0+flags.sw[19]*globe7(ps,Input,flags));
    } else {
        g0 = ptm[3]*ps[0];
    }
    let tlb = ptm[1] * (1.0 + flags.sw[17]*globe7(pd[3],Input,flags))*pd[3][0];
    let s = g0 / (tinf - tlb);
///*      Lower thermosphere temp variations not significant for
// *       density above 300 km */
    if( (Input.alt<300.0) ) {
        meso_tn1[1]=ptm[6]*ptl[0][0]/(1.0-flags.sw[18]*glob7s(ptl[0], Input, flags));
        meso_tn1[2]=ptm[2]*ptl[1][0]/(1.0-flags.sw[18]*glob7s(ptl[1], Input, flags));
        meso_tn1[3]=ptm[7]*ptl[2][0]/(1.0-flags.sw[18]*glob7s(ptl[2], Input, flags));
        meso_tn1[4]=ptm[4]*ptl[3][0]/(1.0-flags.sw[18]*flags.sw[20]*glob7s(ptl[3], Input, flags));
        meso_tgn1[1]=ptm[8]*pma[8][0]*(1.0+flags.sw[18]*flags.sw[20]*glob7s(pma[8], Input, flags))*meso_tn1[4]*meso_tn1[4]/(Math.pow((ptm[4]*ptl[3][0]),2.0));
    } else {
        meso_tn1[1]=ptm[6]*ptl[0][0];
        meso_tn1[2]=ptm[2]*ptl[1][0];
        meso_tn1[3]=ptm[7]*ptl[2][0];
        meso_tn1[4]=ptm[4]*ptl[3][0];
        meso_tgn1[1]=ptm[8]*pma[8][0]*meso_tn1[4]*meso_tn1[4]/(Math.pow((ptm[4]*ptl[3][0]),2.0));
    }
    let z0 = zn1[3];
    let t0 = meso_tn1[3];
    let tr12 = 1.0;
    //
    let g28=flags.sw[21]*globe7(pd[2], Input, flags);
    //
    let zhf=pdl[1][24]*(1.0+flags.sw[5]*pdl[0][24]*Math.sin(dgtr*Input.g_lat)*Math.cos(dr*(Input.doy-pt[13])));
    output.t[0]=tinf;
    let xmm = pdm[2][4];
    let z = Input.alt;
    ///**** N2 DENSITY ****/
    //
    let db28 = pdm[2][0]*Math.exp(g28)*pd[2][0];
    //
    let RandomVariable = [output.t[1]];
    output.d[2]=densu(z,db28,tinf,tlb,28.0,alpha[2],RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    let dd=output.d[2];
    //
    let zh28=pdm[2][2]*zhf;
    let zhm28=pdm[2][3]*pdl[1][5];
    let xmd=28.0-xmm;
    //
    let tz = [0];
    let b28=densu(zh28,db28,tinf,tlb,xmd,(alpha[2]-1.0),tz,ptm[5],s,mn1, zn1,meso_tn1,meso_tgn1);
    if( ((flags.sw[15]) && (z<=altl[2])) ) {
        //
        var dm28=densu(z,b28,tinf,tlb,xmm,alpha[2],tz,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        //
        output.d[2]=dnet(output.d[2],dm28,zhm28,xmm,28.0);
    }
    let g4 = flags.sw[21]*globe7(pd[0], Input, flags);
    //
    let db04 = pdm[0][0]*Math.exp(g4)*pd[0][0];
    //
    RandomVariable = [output.t[1]];
    output.d[0]=densu(z,db04,tinf,tlb, 4.,alpha[0],RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[0];
    if( ((flags.sw[15]) && (z<altl[0])) ) {
        //
        let zh04=pdm[0][2];
        //
        RandomVariable = [output.t[1]];
        let b04=densu(zh04,db04,tinf,tlb,4.-xmm,alpha[0]-1.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        //
        RandomVariable = [output.t[1]];
        var dm04=densu(z,b04,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        let zhm04=zhm28;
        //
        output.d[0]=dnet(output.d[0],dm04,zhm04,xmm,4.);
        //
        let rl=Math.log(b28*pdm[0][1]/b04);
        let zc04=pdm[0][4]*pdl[1][0];
        let hc04=pdm[0][5]*pdl[1][1];
        //
        output.d[0]=output.d[0]*ccor(z,rl,hc04,zc04);
    }
    let g16= flags.sw[21]*globe7(pd[1],Input,flags);
    //
    let db16 =  pdm[1][0]*Math.exp(g16)*pd[1][0];
    //
    RandomVariable = [output.t[1]];
    output.d[1]=densu(z,db16,tinf,tlb, 16.,alpha[1],RandomVariable,ptm[5],s,mn1, zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[1];
    if( ((flags.sw[15]) && (z<=altl[1])) ) {
        //
        let zh16=pdm[1][2];
        //
        RandomVariable = [output.t[1]];
        let b16=densu(zh16,db16,tinf,tlb,16.0-xmm,(alpha[1]-1.0), RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        //
        RandomVariable = [output.t[1]];
        var dm16=densu(z,b16,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        let zhm16=zhm28;
        //
        output.d[1]=dnet(output.d[1],dm16,zhm16,xmm,16.);
        let rl=pdm[1][1]*pdl[1][16]*(1.0+flags.sw[1]*pdl[0][23]*(Input.f107A-150.0));
        let hc16=pdm[1][5]*pdl[1][3];
        let zc16=pdm[1][4]*pdl[1][2];
        let hc216=pdm[1][5]*pdl[1][4];
        output.d[1]=output.d[1]*ccor2(z,rl,hc16,zc16,hc216);
        //
        let hcc16=pdm[1][7]*pdl[1][13];
        let zcc16=pdm[1][6]*pdl[1][12];
        let rc16=pdm[1][3]*pdl[1][14];
        //
        output.d[1]=output.d[1]*ccor(z,rc16,hcc16,zcc16);
    }
    let g32= flags.sw[21]*globe7(pd[4], Input, flags);
    //
    let db32 = pdm[3][0]*Math.exp(g32)*pd[4][0];
    //
    RandomVariable = [output.t[1]];
    output.d[3]=densu(z,db32,tinf,tlb, 32.,alpha[3],RandomVariable,ptm[5],s,mn1, zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[3];
    if( (flags.sw[15]) ) {
        if( (z<=altl[3]) ) {
            //
            let zh32=pdm[3][2];
            //
            RandomVariable = [output.t[1]];
            let b32=densu(zh32,db32,tinf,tlb,32.-xmm,alpha[3]-1., RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
            output.t[1] = RandomVariable[0];
            //
            RandomVariable = [output.t[1]];
            var dm32=densu(z,b32,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
            output.t[1] = RandomVariable[0];
            let zhm32=zhm28;
            //
            output.d[3]=dnet(output.d[3],dm32,zhm32,xmm,32.);
            //
            let rl=Math.log(b28*pdm[3][1]/b32);
            let hc32=pdm[3][5]*pdl[1][7];
            let zc32=pdm[3][4]*pdl[1][6];
            output.d[3]=output.d[3]*ccor(z,rl,hc32,zc32);
        }
        let hcc32=pdm[3][7]*pdl[1][22];
        let hcc232=pdm[3][7]*pdl[0][22];
        let zcc32=pdm[3][6]*pdl[1][21];
        let rc32=pdm[3][3]*pdl[1][23]*(1.+flags.sw[1]*pdl[0][23]*(Input.f107A-150.));
        //
        output.d[3]=output.d[3]*ccor2(z,rc32,hcc32,zcc32,hcc232);
    }
    let g40= flags.sw[21]*globe7(pd[5],Input,flags);
    //
    let db40 = pdm[4][0]*Math.exp(g40)*pd[5][0];
    //
    RandomVariable = [output.t[1]];
    output.d[4]=densu(z,db40,tinf,tlb, 40.,alpha[4],RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[4];
    if( ((flags.sw[15]) && (z<=altl[4])) ) {
        //
        let zh40=pdm[4][2];
        //
        RandomVariable = [output.t[1]];
        let b40=densu(zh40,db40,tinf,tlb,40.-xmm,alpha[4]-1.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        //
        RandomVariable = [output.t[1]];
        var dm40=densu(z,b40,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        let zhm40=zhm28;
        //
        output.d[4]=dnet(output.d[4],dm40,zhm40,xmm,40.);
        //
        let rl=Math.log(b28*pdm[4][1]/b40);
        let hc40=pdm[4][5]*pdl[1][9];
        let zc40=pdm[4][4]*pdl[1][8];
        //
        output.d[4]=output.d[4]*ccor(z,rl,hc40,zc40);
    }
    let g1 = flags.sw[21]*globe7(pd[6], Input, flags);
    //
    let db01 = pdm[5][0]*Math.exp(g1)*pd[6][0];
    //
    RandomVariable = [output.t[1]];
    output.d[6]=densu(z,db01,tinf,tlb,1.,alpha[6],RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[6];
    if( ((flags.sw[15]) && (z<=altl[6])) ) {
        //
        let zh01=pdm[5][2];
        //
        RandomVariable = [output.t[1]];
        let b01=densu(zh01,db01,tinf,tlb,1.-xmm,alpha[6]-1., RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        //
        RandomVariable = [output.t[1]];
        var dm01=densu(z,b01,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        let zhm01=zhm28;
        //
        output.d[6]=dnet(output.d[6],dm01,zhm01,xmm,1.);
        //
        rl=Math.log(b28*pdm[5][1]*Math.sqrt(pdl[1][17]*pdl[1][17])/b01);
        let hc01=pdm[5][5]*pdl[1][11];
        let zc01=pdm[5][4]*pdl[1][10];
        output.d[6]=output.d[6]*ccor(z,rl,hc01,zc01);
        //
        let hcc01=pdm[5][7]*pdl[1][19];
        let zcc01=pdm[5][6]*pdl[1][18];
        let rc01=pdm[5][3]*pdl[1][20];
        //
        output.d[6]=output.d[6]*ccor(z,rc01,hcc01,zcc01);
    }
    let g14 = flags.sw[21]*globe7(pd[7],Input,flags);
    //
    let db14 = pdm[6][0]*Math.exp(g14)*pd[7][0];
    //
    RandomVariable = [output.t[1]];
    output.d[7]=densu(z,db14,tinf,tlb,14.,alpha[7],RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    dd=output.d[7];
    if( ((flags.sw[15]) && (z<=altl[7])) ) {
        //
        let zh14=pdm[6][2];
        //
        RandomVariable = [output.t[1]];
        let b14=densu(zh14,db14,tinf,tlb,14.-xmm,alpha[7]-1., RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        //
        RandomVariable = [output.t[1]];
        var dm14=densu(z,b14,tinf,tlb,xmm,0.,RandomVariable,ptm[5],s,mn1,zn1,meso_tn1,meso_tgn1);
        output.t[1] = RandomVariable[0];
        let zhm14=zhm28;
        //
        output.d[7]=dnet(output.d[7],dm14,zhm14,xmm,14.);
        //
        rl=Math.log(b28*pdm[6][1]*Math.sqrt(pdl[0][2]*pdl[0][2])/b14);
        let hc14=pdm[6][5]*pdl[0][1];
        let zc14=pdm[6][4]*pdl[0][0];
        output.d[7]=output.d[7]*ccor(z,rl,hc14,zc14);
        //
        let hcc14=pdm[6][7]*pdl[0][4];
        let zcc14=pdm[6][6]*pdl[0][3];
        let rc14=pdm[6][3]*pdl[0][5];
        //
        output.d[7]=output.d[7]*ccor(z,rc14,hcc14,zcc14);
    }
    let g16h = flags.sw[21]*globe7(pd[8],Input,flags);
    let db16h = pdm[7][0]*Math.exp(g16h)*pd[8][0];
    let tho = pdm[7][9]*pdl[0][6];
    RandomVariable = [output.t[1]];
    dd=densu(z,db16h,tho,tho,16.,alpha[8],RandomVariable,ptm[5],s,mn1, zn1,meso_tn1,meso_tgn1);
    output.t[1] = RandomVariable[0];
    let zsht=pdm[7][5];
    let zmho=pdm[7][4];
    let zsho=scalh(zmho,16.0,tho);
    output.d[8]=dd*Math.exp(-zsht/zsho*(Math.exp(-(z-zmho)/zsht)-1.));
    //
    output.d[5] = 1.66E-24*(4.0*output.d[0]+16.0*output.d[1]+28.0*output.d[2]+32.0*output.d[3]+40.0*output.d[4]+ output.d[6]+14.0*output.d[7]);
    let db48=1.66E-24*(4.0*db04+16.0*db16+28.0*db28+32.0*db32+40.0*db40+db01+14.0*db14);
    //
    z = Math.sqrt(Input.alt*Input.alt);
    RandomVariable = [output.t[1]];
    let ddum = densu(z,1.0, tinf, tlb, 0.0, 0.0, RandomVariable, ptm[5], s, mn1, zn1, meso_tn1, meso_tgn1);
    output.t[1] = RandomVariable[0];
    if( (flags.sw[0]) ) { // pragma: no cover
        for( let i; i<9; i++ ) {
            output.d[i]=output.d[i]*1.0E6;
        }
        output.d[5]=output.d[5]/1000;
    }
    return;
}
