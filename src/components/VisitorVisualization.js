import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const VisitorVisualization = ({
  scienceVisits = 0,
  dpkhVisits = 0,
  dpkrVisits = 0,
}) => {
  // State to track if we've mounted (for animation purposes)
  const [isMounted, setIsMounted] = useState(false);

  // Calculate total visits
  const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;

  // Only render the chart if there are visits
  if (totalVisits === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Visit Distribution
        </h3>
        <p className="text-gray-500">
          Add visits to see your distribution visualization
        </p>
      </div>
    );
  }

  // Prepare data for the pie chart
  const data = [
    { name: "Discovery Place Science", value: scienceVisits, color: "#3182CE" }, // Blue
    {
      name: "Discovery Place Kids-Huntersville",
      value: dpkhVisits,
      color: "#9F7AEA",
    }, // Purple
    {
      name: "Discovery Place Kids-Rockingham",
      value: dpkrVisits,
      color: "#ED8936",
    }, // Orange
  ].filter((item) => item.value > 0); // Filter out locations with zero visits

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`p-6 bg-white rounded-lg shadow border border-gray-200 transition-opacity duration-500 ${
        isMounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Your Visit Distribution
      </h3>

      {/* Accessible table for screen readers */}
      <div className="sr-only">
        <h4>Visit Distribution Table</h4>
        <table>
          <caption>
            Distribution of your visits across Discovery Place locations
          </caption>
          <thead>
            <tr>
              <th scope="col">Location</th>
              <th scope="col">Number of Visits</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.name}>
                <th scope="row">{item.name}</th>
                <td>{item.value} visits</td>
                <td>{Math.round((item.value / totalVisits) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual pie chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              labelLine={true}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              animationDuration={1000}
              animationBegin={300}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} visits`, "Visits"]}
              contentStyle={{
                borderRadius: "8px",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2">Visit Insights</h4>
        <p className="text-blue-700 text-sm leading-relaxed">
          {getInsightMessage(
            scienceVisits,
            dpkhVisits,
            dpkrVisits,
            totalVisits
          )}
        </p>
      </div>
    </div>
  );
};

// Helper function to generate insight messages based on visit patterns
const getInsightMessage = (
  scienceVisits,
  dpkhVisits,
  dpkrVisits,
  totalVisits
) => {
  // Check for single-location visitors
  if (scienceVisits === totalVisits) {
    return `You exclusively visit Discovery Place Science. A Science membership would be most cost-effective for your family.`;
  } else if (dpkhVisits === totalVisits) {
    return `You exclusively visit Discovery Place Kids-Huntersville. A Kids-Huntersville membership would be most cost-effective for your family.`;
  } else if (dpkrVisits === totalVisits) {
    return `You exclusively visit Discovery Place Kids-Rockingham. A Kids-Rockingham membership would be most cost-effective for your family.`;
  }

  // Multi-location visitors
  const primaryLocation = Math.max(scienceVisits, dpkhVisits, dpkrVisits);
  const primaryPercentage = Math.round((primaryLocation / totalVisits) * 100);

  if (primaryPercentage >= 75) {
    // Mostly visits one location
    let locationName =
      scienceVisits === primaryLocation
        ? "Discovery Place Science"
        : dpkhVisits === primaryLocation
        ? "Discovery Place Kids-Huntersville"
        : "Discovery Place Kids-Rockingham";

    return `You primarily visit ${locationName} (${primaryPercentage}% of visits). A single-location membership with guest discounts at other locations would likely be best.`;
  } else {
    // Visits multiple locations regularly
    return `You visit multiple Discovery Place locations regularly. A Science + Kids membership would provide the most flexibility and value for your family.`;
  }
};

export default VisitorVisualization;
