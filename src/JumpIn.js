import React, { Component } from 'react';
import $ from "jquery";
import moment from "moment";
import './JumpIn.css';

var timeSort = function (l, r) {
  return r.created_at.localeCompare(l.created_at);
};

var issuesUrl = "https://api.github.com/search/issues";

var chefRepos = ["chef", "ohai", "mixlib-install", "chef-dk", "mixlib-authentication", "mixlib-shellout"];

var issueTypes = [
  { name: "Chef", selected: true, org: "chef", description: "Work on the chef-client, ohai, or any of the support libraries.", color: "#F18B21" },
  { name: "Cookbooks", selected: true, org: "chef-cookbooks", description: "Work on our community cookbooks", color: "#F18B21" }
];

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

var getMentoredIssues = function(callback) {
  var repos = chefRepos.map( x => "repo:chef/" + x ).join("+");
  
  var issues = $.ajax({
    dataType: "json",
    url: issuesUrl,
    data: "q=is:issue+state:open+label:\"Type%3A+Mentored\"+" + repos + "&sort=updated"
  });
  
  var cookbookIssues = $.ajax({
    dataType: "json",
    url: issuesUrl,
    data: "q=is:issue+state:open+label:\"Type%3A+Mentored\"+user:chef-cookbooks&sort=updated"
  });
  
  var dataExtractor = extractFunction(callback);
  
  $.when(issues, cookbookIssues).done(dataExtractor);
};

class Filter extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(e) {
    this.props.onClick(this.props.filter.name);
  }
  
  render() {
    const filter = this.props.filter;
    return (
      <span className="filter" style={{ color: "black", backgroundColor: filter.color, opacity: filter.selected ? 1.0 : 0.5 }} onClick={this.handleClick}>{filter.name}</span>
    )
  }
}

class Label extends Component {
  getStyle(label) {
    if (/^Type:/.test(label.name)) {
      return ({ color: "black", backgroundColor: "#d7e102" });
    } else {
      return({ color: "black", backgroundColor: "#" + label.color });
    }
  }
  
  render() {
    const label = this.props.label;
    return (
      <span className="label" style={this.getStyle(label)}>{label.name}</span>
    )
  }
}
class Issue extends Component {
  repoUrl(url) {
    var urlArray = url.split("/");
    return urlArray[urlArray.length - 3];
  }

  filterLabels(labels) {
    var filteredLabels = labels.filter(function(label) {
      var name = label.name;
      // for now, we only want type and area labels, and we already know we're a jump in.
      if ((/^Type:/.test(name) && !/(Jump In|Mentored)/.test(name)) || (/^Area:/.test(name))) {
        return true;
      }
      return false;
    });
    return filteredLabels;
  }
  
  render() {
    const issue = this.props.issue;
    return (
      <li key={issue.number} className="issue">
      <div>
      <a className="issue-link" title={issue.title} href={issue.html_url}>{this.repoUrl(issue.html_url)} {issue.number}</a><span> - </span><span>{issue.title}</span>
      </div>
      <div className="issue-labels">
        {this.filterLabels(issue.labels).map((label) =>
         <Label label={label}/>
        )}
      </div>
      <div className="issue-age">
        <span className="time"><i className="fa fa-clock-o"/><span className="updated"> Last activity: {moment(issue.updated_at).fromNow()}</span></span>
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
      openMentoredIssues: [],
      openIssuesLoading: true,
      mentoredIssuesLoading: true,
      repoFilters: issueTypes,
      limited: true
    };
    this.selectRepo = this.selectRepo.bind(this);
  }
  
  componentDidMount() {
    getOpenIssues(function(data) {
      this.setState({
        openIssues: data,
        openIssuesLoading: false
      });
    }.bind(this));
    getMentoredIssues(function(data) {
      this.setState({
        openMentoredIssues: data,
        mentoredIssuesLoading: false
      });
    }.bind(this));
  }

  selectRepo(filterName) {
    for (var i = 0; i < issueTypes.length; i++) {
      if (issueTypes[i].name === filterName) {
        break;
      }
    }
    
    this.setState(function(oldState) {
      var rf = oldState.repoFilters;
      rf[i].selected = !rf[i].selected;
      return { repoFilters: rf};
    });
  }
    
  filterRepos() {
    var orgs = this.state.repoFilters.filter(function(repo) {
      if (repo.selected) { 
        return true;
      }
      return false;
    });
    var selectedOrgs = orgs.map(repo => repo.org);
    return selectedOrgs;
  }
  
  filterIssues(issues, types) {
    var filteredIssues = issues.filter(function(issue) {
      for (var i = 0; i< types.length; i++) {
        var repoSubStr = "github.com/repos/" + types[i] + "/";
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
        <main className="main-content">
          <div className="chs-page-content">
            <div className="chs-panel chs-panel__large">
              <div className="content">
                <h2>Jump In to Chef development!</h2>
                <p>We'd love you to join the Chef community of contributors and developers,
      so we've selected some issues that we think are good to get started with.</p>
                <p>If you'd like to chat with an existing developer, please join the #chef-dev channel on our <a href="http://community-slack.chef.io/" title="Community Slack">Community Slack</a></p>

                <h2>How would you like to help?</h2>
                <p>There are two primary ways of helping out. You can work on the code at the core of Chef itself, or you can work on our cookbooks.</p><p>Select the labels to make your selection!</p>
                <span className="filters">
                  {this.state.repoFilters.map((filter) =>
                    <Filter filter={filter} onClick={this.selectRepo} />
                  )}               
                </span>
                <h2>Issues to get started with</h2>
                <ul>
                  {this.filterIssues(this.state.openIssues, this.filterRepos()).map((issue) =>
                    <Issue issue={issue} />
                  )}
                </ul>
                <h2>Harder issues</h2>
                <p>These are issues where you'll probably need a bit of help from an established developer to get going.</p>
                <ul>
                  {this.filterIssues(this.state.openMentoredIssues, this.filterRepos()).map((issue) =>
                    <Issue issue={issue} />
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default JumpIn;
