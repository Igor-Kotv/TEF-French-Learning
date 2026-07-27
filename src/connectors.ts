export interface ConnectorGroup {
  items: string[];
  title: string;
}

export const connectorGroups: ConnectorGroup[] = [
  {
    title: 'Commencer',
    items: ['Tout d’abord', 'Premièrement', 'Dans un premier temps', 'Pour commencer'],
  },
  {
    title: 'Ajouter',
    items: ['De plus', 'En outre', 'Par ailleurs', 'Ensuite', 'Également'],
  },
  {
    title: 'Opposer',
    items: ['Cependant', 'Toutefois', 'En revanche', 'Néanmoins', 'Au contraire'],
  },
  {
    title: 'Expliquer',
    items: ['En effet', 'Car', 'C’est pourquoi', 'Autrement dit', 'Cela signifie que'],
  },
  {
    title: 'Illustrer',
    items: ['Par exemple', 'Notamment', 'À titre d’exemple', 'Comme le montre'],
  },
  {
    title: 'Conclure',
    items: ['En conclusion', 'Pour conclure', 'Ainsi', 'Par conséquent', 'En somme'],
  },
];
