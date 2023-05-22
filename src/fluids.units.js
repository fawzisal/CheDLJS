__all__ = ['wraps_numpydoc', 'u'];
import { listZip, stringInterpolate, hasAttr, getAttr, setAttr, isInstance } from './_pyjs.js';
const types = require( './types' );
const re = require( './re' );
const inspect = require( './inspect' );
const sys = require( './sys' );
const { getsource, cleandoc } = require( './inspect' );
const functools = require( './functools' );
try:
    const { Iterable } = require( './collections.abc' );
except:
    const { Iterable } = require( './collections' );
const { copy } = require( './copy' );
const fluids = require( './fluids' );
const fluids.vectorized = require( './fluids.vectorized' );
const numpy as np = require( './numpy as np' );
ndarray = np.ndarray;
try:
    const pint = require( './pint' );
    from pint import _DEFAULT_REGISTRY as u;
const { DimensionalityError } = require( './pint' );

except ImportError: // pragma: no cover
    throw ImportError('The unit handling in fluids requires the installation of the package pint, available on pypi or from https://github.com/hgrecco/pint');


/* See fluids.units.rst for documentation for this module. */

try:
    doc_stripped = sys.flags.optimize == 2;
except:
    doc_stripped = false;
// is_critical_flow is broken

export function get_docstring(f) {
    /* Returns the docstring of a function, working in -OO mode also. */
    try { if( f.__doc__ !== null ) { return f.__doc__; } }
    // micropython
    catch( e ) { return null; }
    if( !doc_stripped ) { return null; }
    let src = cleandoc(inspect.getsource(f));
    let single_pos = src.find("'''");
    let double_pos = src.find('"""');
    if( single_pos === -1 ) {
        // Neither
        if( double_pos === -1 ) { return null; }
        return cleandoc(src.split('"""')[1]);
    } else if( double_pos === -1 && single_pos !== -1 ) {
        // single, not double
        return cleandoc(src.split("'''")[1]);
} else {
        // single and double
        if( single_pos < double_pos ) { return cleandoc(src.split("'''")[1]); }
        return cleandoc(src.split('"""')[1]);
    }


}
export function func_args(func) {
    try { return tuple(inspect.getfullargspec(func).args); }
    catch( e ) { return tuple(inspect.getargspec(func).args); }

}
u.autoconvert_offset_to_baseunit = true;


let expr = re.compile('Parameters *\n *-+\n +');
let expr2 = re.compile('Returns *\n *-+\n +');
let match_sections = re.compile('\n *[A-Za-z ]+ *\n *-+');
let match_section_names = re.compile('\n *[A-Za-z]+ *\n *-+');
let variable = re.compile('[a-zA-Z_0-9]* : ');
let match_units = re.compile(r'\[[a-zA-Z0-9().\/*^\- ]*\]');
export function make_dimensionless_units(unit_str) {
    if( unit_str === '-' ) { let unit_str = 'dimensionless'; }
    else if( unit_str === 'various' ) { unit_str = 'dimensionless'; }
    else if( unit_str === 'base SI' ) { unit_str = 'dimensionless'; }
    return unit_str;
}

let parse_numpydoc_variables_units_cache = {};
export function parse_numpydoc_variables_units({func, replace=null}) {
    let text = get_docstring(func);
    if( text === null ) { text = ''; }
    if( replace !== null ) { for( let [ k, v ] of replace ) { text = text.replace(k, v); } }
    let h = hash(text);
    if( h in parse_numpydoc_variables_units_cache ) { return parse_numpydoc_variables_units_cache[h]; }
    let res = parse_numpydoc_variables_units_docstring(text);
    let parse_numpydoc_variables_units_cache[h] = res;
    return res;
}

export function parse_numpydoc_variables_units_docstring(text) {
    let section_names = match_sections.findall(text).map( i =>i.replace('-', '').strip() );
    let section_text = match_sections.split(text);

    let sections = {};
    for( let [ i, j ] of listZip(section_names, section_text.slice(1 )) ) { sections[i] = j; }


    let parsed = {};
    for( let section of ['Parameters', 'Returns', 'Attributes', 'Other Parameters'] ) {
        if( section not in sections ) {
            // Handle the case where the function has nothing in a section
            parsed[section] = {'units': [], 'vars': []};
            continue;
        }
        let p = sections[section];
        let parameter_vars = variable.findall(p).map( i =>i.slice( 0,-2 ).strip() );
        let unit_strings = variable.split(p).slice(1 ).map( i =>i.strip() );
        let units = [];
        for( let i of unit_strings ) {
            let matches = match_units.findall(i);
            // If there is no unit listed, assume it's dimensionless (probably a string)
            if( len(matches) === 0 ) { matches = ['[]']; }
            let match = matches[matches.length - 1]; // Assume the last bracketed group listed is the unit group
            match = match.replace('[', '').replace(']', '');
            if( len(match) === 1 ) { match = make_dimensionless_units(match); }
            match = make_dimensionless_units(match);
            if( match === '' ) { match = 'dimensionless'; }
            units.push(match);
        }
        parsed[section] = {'units': units, 'vars': parameter_vars};
    }
    return parsed;
}


export function check_args_order(func) {
    /*Reads a numpydoc function and compares the Parameters and Other
    Parameters with the input arguments of the actual function signature. Raises
    an exception if not correctly defined.

    getargspec is used for Python 2.7 compatibility and is deprecated in Python
    3.

    >>> check_args_order(fluids.core.Reynolds)
    */
    try { let argspec = inspect.getfullargspec(func); }
    catch( e ) { argspec = inspect.getargspec(func); }
    let parsed_data = parse_numpydoc_variables_units(func);
    // compare the parsed arguments with those actually defined
    let parsed_units = copy(parsed_data['Parameters']['units']);
    let parsed_parameters = copy(parsed_data['Parameters']['vars']);
    if( 'Other Parameters' in parsed_data ) {
        parsed_parameters += parsed_data['Other Parameters']['vars'];
        parsed_units += parsed_data['Other Parameters']['units'];
    }
    if( argspec.args !== parsed_parameters ) { // pragma: no cover
        throw new Error( 'ValueError',stringInterpolate( 'Function %s signature is not the same as the documentation'
                        ' signature = %s; documentation = %s',[func.__name__, argspec.args, parsed_parameters] ) );
    }
}
export function match_parse_units({doc, i=-1}) {
    if( doc === null ) { let matches = ['[]']; }
    else { matches = match_units.findall(doc); }
    // If there is no unit listed, assume it's dimensionless (probably a string)
    if( len(matches) === 0 ) { matches = ['[]']; }
    let match = matches[i]; // Assume the last bracketed group listed is the unit group
    match = match.replace('[', '').replace(']', '');
    if( len(match) === 1 ) { match = make_dimensionless_units(match); }
    if( match === '' ) { match = 'dimensionless'; }
     // TODO - write special wrappers for these cases
    if( match === 'base SI' ) { match = 'dimensionless'; }
    return match;
}


export function convert_input({val, unit, ureg, strict=true}) {
    // Handle optional units which are given
    if ( val === null ) { return val; }
    if ( unit !== 'dimensionless' ) {
        try { return val.to(unit).magnitude; }
        catch( e ) /* AttributeError */ {
            if( strict ) { throw new Error( 'TypeError',stringInterpolate( '%s has no quantity', [(val) ] ) ); }
            else { return val; }
        }
        except DimensionalityError as e:
            throw new Error( 'ValueError',stringInterpolate( 'Converting %s to units of %s raised DimensionalityError: %s',[val, unit, str(e)] ) );
    }
    else {
        if( type(val) === ureg.Quantity ) { return val.to_base_units().magnitude; }
        else { return val; }
    }
}
let pint_expression_cache = {};
export function parse_expression_cached({unit, ureg}) {
    if( unit in pint_expression_cache ) {
        return pint_expression_cache[unit];
    }
    let ans = ureg.parse_expression(unit);
    let pint_expression_cache[unit] = ans;
    return ans;
}


export function convert_output({result, out_units, out_vars, ureg}) {
    // Attempt to handle multiple return values
    // Must be able to convert all values to a pint expression
    let t = type(result);
    let output_count = len(out_units);
    if( Object.is( t, str ) || Object.is( t, bool ) or result === null ) { return result; }
    else if( Object.is( t, dict ) ) {
        for( let [ key, ans ] of result.items() ) {
            let unit = out_units[out_vars.index(key)];
            let result[key] = ans*parse_expression_cached(unit, ureg);
        }
        return result;
    } else if( ( Object.is( t, list ) || Object.is( t, ndarray )) && output_count === 1 ) {
        return np.array(result)*parse_expression_cached(out_units[0], ureg);
    } else if( isInstance(result, Iterable) ) {
        let conveted_result = [];
        for( let [ ans, unit ] of listZip(result, out_units) ) { conveted_result.push(ans*parse_expression_cached(unit, ureg)); }
        return conveted_result;
    } else {
        return result*parse_expression_cached(out_units[0], ureg);
    }


}
let in_vars_cache = {};
let in_units_cache = {};
let out_vars_cache = {};
let out_units_cache = {};
export function wraps_numpydoc({ureg, strict=true}) {
        function decorator(func) {
        let assigned = [attr for attr in functools.WRAPPER_ASSIGNMENTS if hasAttr(func, attr)];
        let updated = [attr for attr in functools.WRAPPER_UPDATES if hasAttr(func, attr)];
        let parsed_info = parse_numpydoc_variables_units(func);

        let in_vars = copy(parsed_info['Parameters']['vars']);
        let in_units = copy(parsed_info['Parameters']['units']);
        if( 'Other Parameters' in parsed_info ) {
            in_vars += parsed_info['Other Parameters']['vars'];
            in_units += parsed_info['Other Parameters']['units'];
        }
        let in_vars_to_dict = {};
        for( let [ i, j ] of listZip(in_vars, in_units) ) {
            let in_vars_to_dict[i] = j;
        }

        let out_units = parsed_info['Returns']['units'];
        let out_vars = parsed_info['Returns']['vars'];
        // Handle the case of dict answers - require the first line's args to be
        // parsed as 'results'
        if( out_vars && 'results' === out_vars[0] ) {
            out_units.pop(0);
            out_vars.pop(0);
        }
        let in_vars_cache[func] = in_vars;
        let in_units_cache[func] = in_units;
        let out_vars_cache[func] = out_vars;
        let out_units_cache[func] = out_units;

        /* @functools.wraps(func, { assigned: assigned, updated: updated }) DECORATOR */
        function wrapper(...values, ...kw) {
            // Convert input ordered variables to dimensionless form, after converting
            // them to the the units specified by their documentation
            let conv_values = [];
            for( let [ val, unit ] of listZip(values, in_units) ) {
                conv_values.push(convert_input(val, unit, ureg, strict));
            }

            // For keyword arguments, lookup their unit; convert to that;
            // handle dimensionless arguments the same way
            let kwargs = {};
            for( let [ name, val ] of kw.items() ) {
                let unit = in_vars_to_dict[name];
                let kwargs[name] = convert_input(val, unit, ureg, strict);
            }
            if( any( list(kw.values()) + list(values).filter( i => type(i) === u.Quantity ).map( i =>type(i.m) === np.ndarray )) ) {
                let result = getAttr(fluids.vectorized, func.__name__)(*conv_values, **kwargs);
            } else {
                let result = func(*conv_values, **kwargs);
            }
            if( type(result) === np.ndarray ) {
                let units = convert_output(result, out_units, out_vars, ureg)[0].units;
                return result*units;
            } else {
                return convert_output(result, out_units, out_vars, ureg);
            }

        }
        return wrapper;
    }
    return decorator;
}


 class UnitAwareClass extends object {
    wrapped = null;
    ureg = u;
    strict = true;
    property_units = {}; // for properties and attributes only
    method_units = {};
    toString() {
        /*Called only on the class instance, not any instance - ever.
        https://stackoverflow.com/questions/10376604/overriding-special-methods-on-an-instance
        */
        return this.wrapped.toString();
    }

    __add__( other) {
        let new_obj = this.wrapped.__add__(other.wrapped);
        let new_instance = copy(self);
        new_instance.wrapped = new_obj;
        return new_instance;
    }

    __sub__( other) {
        let new_obj = this.wrapped.__sub__(other.wrapped);
        let new_instance = copy(self);
        new_instance.wrapped = new_obj;
        return new_instance;
    }

    constructor( *args, **kwargs) {
        let args_base, kwargs_base =  this.input_units_to_dimensionless('__init__', *args, **kwargs);
        this.wrapped = this.wrapped(*args_base, **kwargs_base);
    }

    // @classmethod
    wrap( wrapped) {
        let new = super.__new__(self);
        new.wrapped = wrapped;
        return new;
    }



    __getattr__( name) {
        let instance = true;
        if( name in this.class_methods || name in this.static_methods ) {
            instance = false;
        }
        try {
            let value = getAttr(this.wrapped, name);
        } catch( e ) /* Exception */ {
            throw new Error( 'AttributeError',stringInterpolate( 'Failed to get property %s with error %s',[str(name), str(e)] ) );
        }
        if( value !== null ) {
            if( name in this.property_units ) {
                if( type(value) === dict ) {
                    let d = {};
                    let unit = this.property_units[name];
                    for( let [ key, val ] of value.items() ) {
                        d[key] = val*unit;
                    }
                    return d;
                }
                try {
                    return value*this.property_units[name];
                } catch( e ) {
                    // Not everything is going to work. The most common case here
                    // is returning a list, some of the values being None and so
                    // it cannot be wrapped.
                    return value;
                }
            } else {
                if( hasAttr(value, '__call__') ) {

//                    if not instance:
//                        @functools.wraps(value)
//                        // Special case where self needs to be passed in specifically
//                        def call_func_with_inputs_to_SI(*args, **kwargs):
//                            args_base, kwargs_base = self.input_units_to_dimensionless(self, name, *args, **kwargs)
//                            result = value(*args_base, **kwargs_base)
//                            if name == '__init__':
//                                return result
//                            _, _, _, out_vars, out_units = self.method_units[name]
//                            if not out_units:
//                                return
//                            return convert_output(result, out_units, out_vars, self.ureg)
//
//                    else:
                    /* @functools.wraps(value) DECORATOR */
                    call_func_with_inputs_to_SI(*args, **kwargs) {
                         letlet args_base, kwargs_base = this.input_units_to_dimensionless(name, *args, **kwargs);
                        let result = value(*args_base, **kwargs_base);
                        if( name === '__init__' ) {
                            return result;
                        } else if( Object.is( type(result), this.wrapped ) ) {
                            // Creating a new class, wrap it
                            return this.wrap(result);
}
                         var [_, _, _, out_vars, out_units] = this.method_units[name];
                        if( !out_units ) {
                            return;
                        }
                        return convert_output(result, out_units, out_vars, this.ureg);
                    }

                    return call_func_with_inputs_to_SI;
                }
                throw new Error( 'AttributeError','Error: Property does not yet have units attached' );
            }
        } else {
            return value;
        }

    }
    _another_getattr = classmethod(__getattr__);

    // @classmethod
    input_units_to_dimensionless( name, *values, **kw) {
        let in_vars, in_units, in_vars_to_dict, out_vars, out_units = this.method_units[name];
        let conv_values = [];
        for( let [ val, unit ] of listZip(values, in_units) ) {
            conv_values.push(convert_input(val, unit, this.ureg, this.strict));
        }

        // For keyword arguments, lookup their unit; convert to that;
        // handle dimensionless arguments the same way
        let kwargs = {};
        for( let [ name, val ] of kw.items() ) {
            let unit = in_vars_to_dict[name];
            kwargs[name] = convert_input(val, unit, this.ureg, this.strict);
        }
        return conv_values, kwargs;
    }


}
export function clean_parsed_info(parsed_info) {
    let in_vars = parsed_info['Parameters']['vars'];
    let in_units = parsed_info['Parameters']['units'];
    if( 'Other Parameters' in parsed_info ) {
        in_vars += parsed_info['Other Parameters']['vars'];
        in_units += parsed_info['Other Parameters']['units'];
    }
    let in_vars_to_dict = {};
    for( let [ i, j ] of listZip(in_vars, in_units) ) {
        in_vars_to_dict[i] = j;
    }

    let out_units = parsed_info['Returns']['units'];
    let out_vars = parsed_info['Returns']['vars'];
    // Handle the case of dict answers - require the first line's args to be
    // parsed as 'results'
    if( out_vars && 'results' === out_vars[0] ) {
        out_units.pop(0);
        out_vars.pop(0);
    }
    return in_vars, in_units, in_vars_to_dict, out_vars, out_units;
}


export function wrap_numpydoc_obj(obj_to_wrap) {
    let callable_methods = {};
    let property_unit_map = {};
    let static_methods = set([]);
    let class_methods = set([]);
    try {
        let replace = [['`units`', obj_to_wrap.units]];
    } catch( e ) {
        replace = null;
    }
    let other_bases = obj_to_wrap.__mro__.slice(1,-1 );
    for( let prop of dir(obj_to_wrap) ) {
        let attr = getAttr(obj_to_wrap, prop);
        if( isInstance(attr, types.FunctionType) || isInstance(attr, types.MethodType) or type(attr) === property ) {
            try {
                if( isInstance(obj_to_wrap.__dict__[prop], staticmethod) ) {
                    static_methods.add(prop);
                }
                if( isInstance(obj_to_wrap.__dict__[prop], classmethod) ) {
                    class_methods.add(prop);
                }
            } catch( e ) {
                /* /* pass */ */
            }
            if( Object.is( type(attr), property ) ) {
                let name = prop;
            } else {
                name = prop; // Do not use attr.__name__ here to allow aliases, use whatever it was assigned to
            }
            let found_doc = hasAttr(attr, '__doc__') && attr.__doc__ !== null;
            if( !found_doc && other_bases ) {
                for( let base of other_bases ) {
                    if( hasAttr(base, prop) ) {
                        let base_prop = getAttr(base, prop);
                        found_doc = hasAttr(base_prop, '__doc__') && base_prop.__doc__ !== null;
                        if( found_doc ) {
                            attr = base_prop;
                            break;
                        }
                    }
                }
            }
            if( found_doc ) {
                if( Object.is( type(attr), property ) ) {
                    try {
                        let docstring = attr.__doc__;
                        if( docstring === null ) {
                            docstring = attr.fget.__doc__;
                        }
                        if( 'Returns' in docstring && '-------' in docstring ) {
                                let found_unit = parse_expression_cached(parse_numpydoc_variables_units_docstring(docstring)['Returns']['units'][0], u);
                        } else {
                            found_unit = parse_expression_cached(match_parse_units(docstring, { i: 0 }), u);
                        }
                    } catch( e ) /* Exception */ {
                        if( name[0] === '_' ) {
                            found_unit = u.dimensionless;
                        } else {
                            console.log(stringInterpolate( 'Failed on attribute %s', [name ] ));
                            throw new Error( 'e' );
                        }
                    }
                    property_unit_map[name] = found_unit;
                } else {
                    let parsed = parse_numpydoc_variables_units(attr, replace);
                    callable_methods[name] = clean_parsed_info(parsed);
                    if( 'Attributes' in parsed ) {
                        property_unit_map.update(parsed['Attributes']);
                    }
                }
            }
        }
    }
    for( let inherited of reversed(list(obj_to_wrap.__mro__.slice(0,-1 ))) ) {
        parsed = parse_numpydoc_variables_units(inherited, replace);
        callable_methods['__init__'] = clean_parsed_info(parsed);
        // if 'All parameters are also attributes' in get_docstring(inherited):
        //     pass

        if( 'Attributes' in parsed ) {
            property_unit_map.update( 
                                      listZip(parsed['Attributes']['vars'], parsed['Attributes']['units']).reduce( ( __map, [ var, unit ] ) => ( { ...__map, [var ]:parse_expression_cached(make_dimensionless_units(unit), u) } ), {} ) );
        }
        if( 'Parameters' in parsed ) {
            property_unit_map.update( 
                                      listZip(parsed['Parameters']['vars'], parsed['Parameters']['units']).reduce( ( __map, [ var, unit ] ) => ( { ...__map, [var ]:parse_expression_cached(make_dimensionless_units(unit), u) } ), {} ) );
        }
    }
    name = obj_to_wrap.__name__;
    let classkwargs = {'wrapped': obj_to_wrap,
            'property_units': property_unit_map, 'method_units': callable_methods,
                   'static_methods': static_methods, 'class_methods': class_methods};

    let fun = type(name, [UnitAwareClass,], classkwargs
           );
    for( let m of static_methods ) {
        //def a_static_method(*args, the_method=m, **kwargs):
            //return fun._another_getattr(the_method)(*args, **kwargs)
        setAttr(fun, m, staticmethod(fun._another_getattr(m)));
    }
    for( let m of class_methods ) {
        setAttr(fun, m, classmethod(fun._another_getattr(m)));
    }
    return fun;
}

export function kwargs_to_args({args, kwargs, signature}) {
    /*Accepts an *args and **kwargs and a signature
    like ['rho', 'mu', 'nu'] which is an ordered list of
    all accepted arguments.

    Returns a list containing all the arguments, sorted, and
    left as None if not specified
    */
    let argument_number = len(signature);
    let arg_number = len(args);
    let output = list(args);
    // Extend the list and initialize as None by default
    output.extend([null]*(argument_number - arg_number));
    for( let i=arg_number; i < argument_number; i++ ) {
        if( signature[i] in kwargs ) {
            output[i] = kwargs[signature[i]];
        }
    }
    return output;
}


__pint_wrapped_functions = {};

for (name in dir(fluids)){
    if (name.indexOf('RectangularOffsetStripFinExchanger') > -1) continue;
    if (name.indexOf('ParticleSizeDistribution') > -1){ continue; }
    if (name == '__getattr__' || name == '__test__') { continue; }
    obj = getAttr(fluids, name);
    if (isInstance(obj, types.FunctionType)){ obj = wraps_numpydoc(u)(obj); }
    else if (type(obj) == type){ obj = wrap_numpydoc_obj(obj); }
    // Functions accessed with the namespace like friction.friction_factor
    // would call the original function - leads to user confusion if they are exposed
    else if (type(obj) is types.ModuleType) { continue; }
    else if (isInstance(obj, str)) { continue; }
    if (name == '__all__') { continue; }
    __all__.push(name);
    __pint_wrapped_functions.update({name: obj});
}
globals().update(__pint_wrapped_functions);
__all__.extend(['wraps_numpydoc', 'convert_output', 'convert_input',
                'check_args_order', 'match_parse_units', 'parse_numpydoc_variables_units',
                'wrap_numpydoc_obj', 'UnitAwareClass']);
export function A_multiple_hole_cylinder({Do, L, holes}) {
    let Do = Do.to(u.m).magnitude;
    let L = L.to(u.m).magnitude;
    let holes = holes.map( ( [ i, N ] ) =>[i.to(u.m).magnitude, N] );
    let A = fluids.geometry.A_multiple_hole_cylinder(Do, L, holes);
    return A*u.m**2;
}

export function V_multiple_hole_cylinder({Do, L, holes}) {
    let Do = Do.to(u.m).magnitude;
    let L = L.to(u.m).magnitude;
    let holes = holes.map( ( [ i, N ] ) =>[i.to(u.m).magnitude, N] );
    let A = fluids.geometry.V_multiple_hole_cylinder(Do, L, holes);
    return A*u.m**3;
}

variable_output_unit_funcs = {
    // True: arg should be present; False: arg should be None
    'nu_mu_converter': ({(true, false, true): [u.Pa*u.s], (true, true, false): [u.m**2/u.s], }, 3),
    'differential_pressure_meter_solver': ({(true, true, true, true, false, true, true, true): [u.m],
                                            (true, true, true, true, true, false, true, true): [u.Pa],
                                            (true, true, true, true, true, true, false, true): [u.Pa],
                                            (true, true, true, true, true, true, true, false): [u.kg/u.s],
                                            }, 8),
    'isothermal_gas': ({(true, true, false, true, true, true, true): [u.Pa],
                        (true, true, true, false, true, true, true): [u.Pa],
                        (true, true, true, true, false, true, true): [u.m],
                        (true, true, true, true, true, false, true): [u.m],
                        (true, true, true, true, true, true, false): [u.kg/u.s],
                        }, 7)
};

simple_compressible_variable_output = ({(true, true, false, true, true, true, true): [u.m],
                                        (true, true, true, false, true, true, true): [u.m],
                                        (true, true, true, true, false, true, true): [u.Pa],
                                        (true, true, true, true, true, false, true): [u.Pa],
                                        (true, true, true, true, true, true, false): [u.m**3/u.s],
                                        }, 7);
for f in ['Panhandle_A', 'Panhandle_B', 'Weymouth', 'Spitzglass_high', 'Spitzglass_low', 'Oliphant', 'Fritzsche']:
    variable_output_unit_funcs[f] = simple_compressible_variable_output;

IGT_Muller_variable_output = ({(true, true, true, false, true, true, true, true): [u.m],
                               (true, true, true, true, false, true, true, true): [u.m],
                               (true, true, true, true, true, false, true, true): [u.Pa],
                               (true, true, true, true, true, true, false, true): [u.Pa],
                               (true, true, true, true, true, true, true, false): [u.m**3/u.s],
                               }, 8);

for f in ['Muller', 'IGT']:
    variable_output_unit_funcs[f] = IGT_Muller_variable_output;

export function variable_output_wrapper({func, wrapped_basic_func, output_signatures, input_length}) {
    let name = func.__name__;
    let intput_signature = in_vars_cache[func];
    function thing(...args, ...kwargs) {
        let ans = wrapped_basic_func(*args, **kwargs);
        let args_for_sig = kwargs_to_args(args, kwargs, intput_signature);
        let args_for_sig = args_for_sig.map( i =>i !== null );
        // Allow other arguments later to not matter
        if( len(args_for_sig) > input_length ) { args_for_sig = args_for_sig.slice( 0,input_length ); }
        let output_units = output_signatures[tuple(args_for_sig)];
        if( type(ans) in [list, tuple] ) { return range(len(ans)).map( i =>output_units[i]*ans[i] ); }
        return output_units[0]*ans;
    }
    return thing;
}

for (name in variable_output_unit_funcs){
    val = variable_output_unit_funcs[name];
    globals()[name] = variable_output_wrapper(getAttr(fluids, name),
            __pint_wrapped_functions[name], val[0], val[1]);
}

