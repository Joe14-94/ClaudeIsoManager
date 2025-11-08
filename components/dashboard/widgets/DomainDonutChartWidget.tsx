import React from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import DomainDonutChart from '../../charts/DomainDonutChart';
import { useNavigate } from 'react-router-dom';
import { SecurityDomain } from '../../../types';

const DomainDonutChartWidget: React.FC = () => {
  const { activities } = useData();
  const navigate = useNavigate();

  const handleSliceClick = (domain: SecurityDomain) => {
    navigate('/activities', { state: { domainFilter: domain } });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Activités par domaine</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <DomainDonutChart data={activities} onSliceClick={handleSliceClick} />
      </CardContent>
    </div>
  );
};

export default DomainDonutChartWidget;
