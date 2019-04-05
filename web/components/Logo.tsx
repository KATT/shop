import React from 'react';
const KATTCORP_LOGO = `
             / )
 / )__/ )___/ /
( @ . @ )     )
 (           )
 //"//""//"//

 KATTCORP LTD.`;

const Logo = () => (
  <div>
    <pre dangerouslySetInnerHTML={{ __html: KATTCORP_LOGO.substr(1) }} />
    <style>{`
      pre {
        text-align: left;
        display: inline-block;
      }
      `}</style>
  </div>
);

export default Logo;
