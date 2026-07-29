import type { Rule } from "../../types/drawing";

interface Props {

    rules: Rule[];

}

export default function RuleTable({

    rules

}: Props) {

    return (

        <div className="card">

            <h2>Rule Validation</h2>

            <table>

                <thead>

                <tr>

                    <th>Rule</th>

                    <th>Status</th>

                    <th>Reason</th>

                </tr>

                </thead>

                <tbody>

                {

                    rules.map(rule => (

                        <tr key={rule.rule}>

                            <td>{rule.rule}</td>

                            <td>

                                {

                                    rule.status === "PASS"

                                        ? "✅ PASS"

                                        : "❌ FAIL"

                                }

                            </td>

                            <td>{rule.reason}</td>

                        </tr>

                    ))

                }

                </tbody>

            </table>

        </div>

    );

}