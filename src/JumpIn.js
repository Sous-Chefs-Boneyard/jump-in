/* global $, React*/
import React, { Component } from 'react';
import './JumpIn.css';

var timeSort = function (l, r) {
  return r.created_at.localeCompare(l.created_at);
};

var issuesUrl = "https://api.github.com/search/issues";

var chefRepos = ["chef", "ohai", "mixlib-install", "chef-dk", "mixlib-authentication", "mixlib-shellout"];

var extractFunction = function(callback) {
  return function(rb, cb) {
    var chef = rb[0].items, 
      cookbooks = cb[0].items, 
      all = chef.concat(cookbooks);

    all.sort(timeSort);
    callback(all);
  };
};

var getOpenIssues = function(callback) {
  var repos = chefRepos.map( x => "repo:chef/" + x ).join("+");

  var issues = $.ajax({
    dataType: "json",
    url: issuesUrl,
    data: "q=is:issue+state:open+label:\"Type%3A+Jump+In\"+" + repos + "&sort=updated"
  });
  
  var cookbookIssues = $.ajax({
    dataType: "json",
    url: issuesUrl,
    data: "q=is:issue+state:open+label:\"Type%3A+Jump+In\"+user:chef-cookbooks&sort=updated"
  });

  var dataExtractor = extractFunction(callback);

  $.when(issues, cookbookIssues).done(dataExtractor);
};

var repoUrl = function(url) {
  var urlArray = url.split("/");
  return urlArray[urlArray.length - 3];
};

class Issue extends Component {
  render() {
    return (
      <li key={this.props.issue.number} className="issue">
        <div>
          <a className="issue-link" title={this.props.issue.title} href={this.props.issue.html_url}>{repoUrl(this.props.issue.html_url)} {this.props.issue.number}</a><span> - </span><span>{this.props.issue.title}</span>
        </div>
      </li>
    )
  }
}

class JumpIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openIssues: [],
      openCookbookIssues: [],
      openIssuesLoading: true
    };
  }

  componentDidMount() {
    getOpenIssues(function(data) {
      this.setState({
        openIssues: data,
        openIssuesLoading: false
      });
    }.bind(this));
  }

  filterIssues(issues, types) {
    var filteredIssues = issues.filter(function(issue) {
      for (var i = 0; i< types.length; i++) {
        var repoSubStr = "github.com/repos/" + types[i] + "/";
        console.log("repoSubStr is " + repoSubStr + " and issue url is " + issue.url);
        if (issue.url && issue.url.match(repoSubStr)) {
          return true;
        };
      }
      return false; 
    });
    return filteredIssues;
  }

  render() {
    return (
      <div className="JumpIn">
        <div className="chs-page-header">
        
        </div>
        <main className="main-content">
        <div className="chs-page-content">
          <div className="chs-panel chs-panel__large">
            <div className="content">
          <h2>Jump In to Chef development!</h2>
          <p>We'd love you to join the Chef community of contributors and developers, 
            so we've selected some issues that we think are good to get started with.</p>
          <p>If you'd like to chat with an existing developer, please join the #chef-dev channel on our <a href="http://community-slack.chef.io/" title="Community Slack">Community Slack</a></p>

          <h2>Open Issues</h2>
        <ul>
          {this.filterIssues(this.state.openIssues, ["chef", "chef-cookbooks"]).map((issue) =>
            <Issue issue={issue}/>
          )}
        </ul>
        </div>
        </div>
        </div></main>
      </div>
    );
  }
}

export default JumpIn;
