import React from 'react'
import fetch from 'node-fetch'
import sortby from 'lodash.sortby'
import moment from 'moment'


const segments = ['18812247', '18812294', '18812361', '18812397']
const segmentRequest = (id) => fetch(
  `https://www.strava.com/api/v3/segments/${id}/leaderboard?gender=&age_group=&weight_class=&following=&club_id=&date_range=this_month&per_page=50`,
  {
    headers: { 
      Authorization: 'Bearer e4ed9f2a0daaa4f0058868e4641011913e5da1b3'
    }
  }
).then(res => res.json())

const mapToAthlete = (results) => results.map(res => ({
  [res.athlete_name] : res.seconds
}))

const requestAllSegments = async () => Promise.all(
  segments.map(seg => segmentRequest(seg))
)

const resultsRows = (results, isDnf) => results.map((result, rank) => (
  <tr>
    <td>{rank + 1}</td>
    <td>{result.athlete_name}</td>
    <td>
        {isDnf 
          ? 'N/A' 
          : moment().hours(0).seconds(result.elapsed_time).format('H:mm:ss')
        }
    </td>
  </tr>  
))

export default class extends React.Component {
  static async getInitialProps() {
    const [
      segmentOne, 
      segmentTwo, 
      segmentThree, 
      segmentFour
    ] = await requestAllSegments()
    
    const combined = sortby(
      []
        // flatten all entires 
        .concat(segmentOne.entries, segmentTwo.entries, segmentThree.entries, segmentFour.entries)
        
        // produce results by athlete
        .reduce((results, record) => {
          if (!results[record.athlete_name]) {
            results[record.athlete_name] = {
              elapsed_time: 0,
              athlete_name: record.athlete_name,
              segments_completed: 0
            }
          }
          results[record.athlete_name].elapsed_time += record.elapsed_time
          results[record.athlete_name].segments_completed += 1
          return results
        }, {})
      , ['elapsed_time']
    )

    return {
      segmentOne,
      segmentTwo,
      segmentThree,
      segmentFour,
      finalResults: combined.filter(athlete => athlete.segments_completed === 4),
      finalDNF: combined.filter(athlete => athlete.segments_completed < 4)
    }
  }

  render() {
    const {
      segmentOne,
      segmentTwo,
      segmentThree,
      segmentFour,
      finalResults,
      finalDNF
    } = this.props
    return (
      <div className="all">
        <style global jsx>{`
          @import url('https://fonts.googleapis.com/css?family=Montserrat');
          .all {
            font: 15px 'Montserrat', Helvetica, Arial, sans-serif;
            text-align: center;
            width: 300px;
            margin: 0 auto;
            font-weight: 100;
          }
          h1, h2, h3, h6 {
            color: #444;
            font-weight: 200;
          }
          h2 {
            font-size: 20px;
            font-weight: 500;
            text-transform: uppercase;

          }
          table {
            border-top: 1px solid #ddd;
            width: 100%;
            margin-bottom: 50px;
          }
          tr:nth-child(odd) {
            background-color: #f2f2f2;
          }
          td {
            text-align: center;
            padding: 3px;
          }
          
          
        `}</style> 
        <a href="https://www.thecarriboojack.com/">
          <img src="/static/logo.png" alt="the carriboo jack" />
        </a>
        <h1>Official Results</h1> 
        <h2>Safety Break // Stage 1</h2>
        <table>
          {resultsRows(segmentOne.entries)}
        </table> 

        <h2>Mike's Cabin // Stage 2</h2>
        <table>
          {resultsRows(segmentTwo.entries)}
        </table> 

        <h2>Meadow Skippin' // Stage 3</h2>
        <table>
          {resultsRows(segmentThree.entries)}
        </table>

        <h2>Drift Track // Stage 4</h2>
        <table>
          {resultsRows(segmentFour.entries)}
        </table>

        <h2>Overall Results</h2>
        <table>
          {resultsRows(finalResults)}
        </table>

        <h2>DNF</h2>
        <table>
          {resultsRows(finalDNF, true)}
        </table>
        
        <h6>Powered By <a href="http://strava.com" target="_blank">Strava</a></h6>
      </div>
    )
  }
}