// Read-only GitHub evidence. Credentials stay in memory and are never logged or written.
const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const repoRoot='C:/Users/azrie/Documents/antigravity/goofy-maxwell';
const origin=new URL(cp.execFileSync('git',['config','--get','remote.origin.url'],{cwd:repoRoot,encoding:'utf8'}).trim());
if(origin.hostname!=='github.com'||origin.pathname!=='/OlatolaIL/ulpana-hebrew.git')throw new Error('Unexpected repository origin');
const credential=decodeURIComponent(origin.password||origin.username);
const headers={Accept:'application/vnd.github+json','User-Agent':'Ulpan-Alef-readonly-review','X-GitHub-Api-Version':'2026-03-10'};
if(credential)headers.Authorization='Bearer '+credential;
const base='/repos/OlatolaIL/ulpana-hebrew';
async function get(endpoint,select){
  try{
    const response=await fetch('https://api.github.com'+endpoint,{method:'GET',headers,signal:AbortSignal.timeout(12000),redirect:'error'});
    const body=await response.json();
    return {endpoint,status:response.status,...(response.ok?{data:select(body)}:{error:response.status===401?'unauthorized':response.status===403?'forbidden':response.status===404?'not found or not visible':'HTTP failure'})};
  }catch{return {endpoint,error:'request failed or timed out'};}
}
(async()=>{
  const result={capturedAt:new Date().toISOString(),localHead:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repoRoot,encoding:'utf8'}).trim(),remoteContainsCredential:Boolean(credential),requests:[]};
  const info=await get(base,d=>({full_name:d.full_name,private:d.private,default_branch:d.default_branch,archived:d.archived,permissions:d.permissions}));
  result.requests.push(info);
  if(info.status===200){
    const branch=encodeURIComponent(info.data.default_branch);
    const endpoints=[
      [base+'/branches/'+branch,d=>({name:d.name,sha:d.commit.sha,protected:d.protected,protection:d.protection})],
      [base+'/branches/'+branch+'/protection',d=>({required_status_checks:d.required_status_checks,enforce_admins:d.enforce_admins,required_pull_request_reviews:d.required_pull_request_reviews,allow_force_pushes:d.allow_force_pushes,allow_deletions:d.allow_deletions})],
      [base+'/rules/branches/'+branch,d=>d],
      [base+'/actions/workflows',d=>({total_count:d.total_count,workflows:d.workflows.map(w=>({id:w.id,name:w.name,path:w.path,state:w.state}))})],
      [base+'/actions/runs?per_page=5',d=>({total_count:d.total_count,runs:d.workflow_runs.map(r=>({id:r.id,name:r.name,event:r.event,head_sha:r.head_sha,status:r.status,conclusion:r.conclusion,created_at:r.created_at,html_url:r.html_url}))})],
      [base+'/contents/.github/workflows/beta-checks.yml?ref='+branch,d=>({path:d.path,sha:d.sha,size:d.size})],
      ['/repos/actions/checkout/git/ref/tags/v7',d=>({ref:d.ref,sha:d.object.sha,type:d.object.type})],
      ['/repos/actions/setup-node/git/ref/tags/v7',d=>({ref:d.ref,sha:d.object.sha,type:d.object.type})],
    ];
    result.requests.push(...await Promise.all(endpoints.map(([endpoint,select])=>get(endpoint,select))));
  }
  fs.writeFileSync(path.join(__dirname,'github-gates-readonly.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
})().catch(()=>{console.error('Read-only review failed; no credential details emitted');process.exitCode=1;});
