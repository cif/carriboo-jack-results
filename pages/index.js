import React from 'react'
import fetch from 'node-fetch'
import sortby from 'lodash.sortby'

const segments = ['18812247', '18812294', '18812361', '18812397']
const segmentRequest = (id) => fetch(
  `https://www.strava.com/api/v3/segments/${id}/leaderboard?gender=&age_group=&weight_class=&following=&club_id=&date_range=this_year`,
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

const resultsRows = (results) => results.map(result => (
  <tr>
    <td>{result.athlete_name}</td>
    <td>{result.elapsed_time}</td>
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
    
    const finalResults = sortby(
      []
        // flatten all entires 
        .concat(segmentOne.entries, segmentTwo.entries, segmentThree.entries, segmentFour.entries)
        
        // produce results by athlete
        .reduce((results, record) => {
          if (!results[record.athlete_name]) {
            results[record.athlete_name] = {
              elapsed_time: 0,
              athlete_name: record.athlete_name
            }
          }
          results[record.athlete_name].elapsed_time += record.elapsed_time
          return results
        }, {})
      , ['elapsed_time']
    )

    return {
      segmentOne,
      segmentTwo,
      segmentThree,
      segmentFour,
      finalResults
    }
  }

  render() {
    const {
      segmentOne,
      segmentTwo,
      segmentThree,
      segmentFour,
      finalResults
    } = this.props
    return (
      <div>
        
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

        <h2>All Stages</h2>
        <table>
          {resultsRows(finalResults)}
        </table>
        
        
      </div>
    )
  }
}