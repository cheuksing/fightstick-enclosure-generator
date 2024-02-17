import React from 'react';
import {Modal} from '../components/modal';
import {Redirect, type RouteComponentProps} from 'wouter';

import {ReactComponent as Guide} from './guide.md';

const guidesContent: Record<string, React.ComponentProps<typeof Modal>> = {
  guide: {
    title: 'Guide',
    content: <Guide />,
  },
};

export const Guides: React.FC<RouteComponentProps<{id: string}>> = ({params}) => {
  if (!params?.id) {
    return null;
  }

  const data = guidesContent[params.id];

  if (!data) {
    return <Redirect to='/' />;
  }

  return (
    <Modal title={data.title} content={data.content} />
  );
};
