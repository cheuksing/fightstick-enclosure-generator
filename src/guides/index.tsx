import React, {lazy} from 'react';
import {Modal} from '../components/modal';
import {Redirect, type RouteComponentProps} from 'wouter';

const Guide = lazy(async () => import('./guide.md').then(module => ({default: module.ReactComponent}))); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

const guidesContent: Record<string, {title: string; content: React.VFC}> = {
  guide: {
    title: 'Guide',
    content: Guide,
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
    <Modal title={data.title} content={React.createElement(data.content)} />
  );
};
