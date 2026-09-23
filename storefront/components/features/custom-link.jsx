import Link from "next/link";

import { parseContent } from '~/utils';

export default function ALink ( { children, className, content, style, itemProp, href, ...props } ) {

    const preventDefault = ( e ) => {
        if ( props.href === '#' ) {
            e.preventDefault();
        }

        if ( props.onClick ) {
            props.onClick();
        }
    }

    return (
        content ? (
            <Link href={href} itemProp={itemProp} className={ className } style={ style } onClick={ preventDefault } dangerouslySetInnerHTML={ parseContent( content )} { ...props } >
                { children }
            </Link>
          ): (
            <Link href={href} itemProp={itemProp} className={ className } style={ style } onClick={ preventDefault } { ...props } >
                { children }
            </Link>
          )
    )
}
